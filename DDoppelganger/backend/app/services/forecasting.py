"""
Prediction / forecasting capability.

Runs a lightweight linear-trend regression (numpy polyfit, degree 1) over each
skill's monthly job-posting mention counts to flag rising vs. declining
skills, and derives a per-user "skill obsolescence risk" score from how many
of the user's own skills sit in a declining trend, weighted by how strongly
they hold each one.

A real deployment would swap the polyfit for Prophet/ARIMA over live job-board
ingestion; the interface (`SkillTrend` rows in, slope/forecast out) stays the
same either way.
"""
from dataclasses import dataclass
from typing import List

import numpy as np


@dataclass
class TrendResult:
    skill_name: str
    category: str
    history: List[tuple]  # (period, mention_count)
    slope: float
    direction: str
    forecast_next: float


def compute_trend(skill_name: str, category: str, history: List[tuple]) -> TrendResult:
    """history: list of (period_str, mention_count) sorted chronologically."""
    if len(history) < 2:
        last = history[-1][1] if history else 0
        return TrendResult(skill_name, category, history, 0.0, "stable", float(last))

    y = np.array([count for _, count in history], dtype=float)
    x = np.arange(len(y), dtype=float)
    slope, intercept = np.polyfit(x, y, 1)

    mean_y = float(np.mean(y)) or 1.0
    relative_slope = slope / mean_y

    if relative_slope > 0.03:
        direction = "rising"
    elif relative_slope < -0.03:
        direction = "declining"
    else:
        direction = "stable"

    forecast_next = float(slope * len(y) + intercept)
    forecast_next = max(0.0, forecast_next)

    return TrendResult(skill_name, category, history, float(slope), direction, forecast_next)


def compute_decay_score(user_skill_trends: List[tuple]) -> dict:
    """user_skill_trends: list of (skill_name, proficiency, TrendResult).
    Returns a 0-100 obsolescence risk score plus supporting detail."""
    if not user_skill_trends:
        return {
            "risk_score": 0.0,
            "at_risk": [],
            "future_proof": [],
        }

    weighted_risk = 0.0
    total_weight = 0.0
    at_risk, future_proof = [], []

    for skill_name, proficiency, trend in user_skill_trends:
        weight = max(proficiency, 0.1)
        total_weight += weight
        if trend.direction == "declining":
            # heavier reliance (higher proficiency) on a declining skill = higher risk
            weighted_risk += weight * 1.0
            at_risk.append(skill_name)
        elif trend.direction == "stable":
            weighted_risk += weight * 0.35
        else:
            future_proof.append(skill_name)

    risk_score = round(100 * weighted_risk / total_weight, 1) if total_weight else 0.0
    return {
        "risk_score": risk_score,
        "at_risk": at_risk,
        "future_proof": future_proof,
    }
