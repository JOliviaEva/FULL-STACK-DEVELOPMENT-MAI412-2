// Sample data for the UniAI Admissions database (fictional people, fees and seat counts).
// Rows refer to each other by natural keys (programme code, campus name, officer email);
// database/db.js turns those into real foreign-key ids while inserting.
module.exports = {
  "campuses": [
    {
      "name": "Central Campus, Bengaluru",
      "city": "Bengaluru",
      "state": "Karnataka"
    },
    {
      "name": "Bannerghatta Road, Bengaluru",
      "city": "Bengaluru",
      "state": "Karnataka"
    },
    {
      "name": "Kengeri, Bengaluru",
      "city": "Bengaluru",
      "state": "Karnataka"
    },
    {
      "name": "Yeshwanthpur, Bengaluru",
      "city": "Bengaluru",
      "state": "Karnataka"
    },
    {
      "name": "Delhi NCR",
      "city": "Ghaziabad",
      "state": "Uttar Pradesh"
    },
    {
      "name": "Pune Lavasa",
      "city": "Pune",
      "state": "Maharashtra"
    }
  ],
  "programmes": [
    {
      "code": "BTECH-AIML",
      "name": "B.Tech AI & ML",
      "department": "School of Engineering & Technology",
      "durationYears": 4,
      "seats": 120,
      "annualFee": 285000,
      "campuses": [
        "Central Campus, Bengaluru",
        "Delhi NCR",
        "Pune Lavasa"
      ]
    },
    {
      "code": "BTECH-CSE",
      "name": "B.Tech CSE",
      "department": "School of Engineering & Technology",
      "durationYears": 4,
      "seats": 180,
      "annualFee": 265000,
      "campuses": [
        "Central Campus, Bengaluru",
        "Kengeri, Bengaluru",
        "Delhi NCR",
        "Pune Lavasa"
      ]
    },
    {
      "code": "BBA",
      "name": "BBA",
      "department": "School of Business & Management",
      "durationYears": 3,
      "seats": 240,
      "annualFee": 195000,
      "campuses": [
        "Central Campus, Bengaluru",
        "Bannerghatta Road, Bengaluru",
        "Yeshwanthpur, Bengaluru",
        "Delhi NCR",
        "Pune Lavasa"
      ]
    },
    {
      "code": "BALLB",
      "name": "BA LLB",
      "department": "School of Law",
      "durationYears": 5,
      "seats": 120,
      "annualFee": 215000,
      "campuses": [
        "Central Campus, Bengaluru",
        "Delhi NCR",
        "Pune Lavasa"
      ]
    }
  ],
  "officers": [
    {
      "name": "Dr. Olivia",
      "email": "olivia@uniai.example.com",
      "designation": "Senior Admissions Officer"
    },
    {
      "name": "Sheela",
      "email": "sheela@uniai.example.com",
      "designation": "Admissions Officer"
    },
    {
      "name": "Gracia",
      "email": "gracia@uniai.example.com",
      "designation": "Admissions Counsellor"
    }
  ],
  "applications": [
    {
      "applicationNo": "CU-ADM-2026-0001",
      "name": "Johnathan",
      "email": "johnathan@example.com",
      "phone": "9845012376",
      "programmeCode": "BTECH-AIML",
      "campusName": "Central Campus, Bengaluru",
      "officerEmail": "olivia@uniai.example.com",
      "twelfthPct": 94.2,
      "status": "shortlisted",
      "sop": "I want to build AI tools that help rural clinics triage patients faster. My Python projects on crop-disease detection taught me how data can change lives, and CHRIST's AI & ML labs are where I want to take that further.",
      "createdAt": "2026-10-03T09:14:00.000Z",
      "updatedAt": "2026-10-03T09:14:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0002",
      "name": "Evangeline",
      "email": "evangeline@example.com",
      "phone": "9746381205",
      "programmeCode": "BTECH-CSE",
      "campusName": "Kengeri, Bengaluru",
      "officerEmail": "sheela@uniai.example.com",
      "twelfthPct": 88,
      "status": "review",
      "sop": "Competitive programming got me into computer science. I want to study distributed systems and contribute to open-source developer tooling.",
      "createdAt": "2026-10-06T11:02:00.000Z",
      "updatedAt": "2026-10-06T11:02:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0003",
      "name": "Tanisha",
      "email": "tanisha@example.com",
      "phone": "9810457723",
      "programmeCode": "BALLB",
      "campusName": "Delhi NCR",
      "officerEmail": "olivia@uniai.example.com",
      "twelfthPct": 91.5,
      "status": "admitted",
      "sop": "Volunteering at a legal aid camp in Ghaziabad showed me how many people cannot afford advice. I want to specialise in technology law and public-interest litigation.",
      "createdAt": "2026-10-09T15:40:00.000Z",
      "updatedAt": "2026-10-21T10:05:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0004",
      "name": "John",
      "email": "john@example.com",
      "phone": "8892340176",
      "programmeCode": "BBA",
      "campusName": "Bannerghatta Road, Bengaluru",
      "officerEmail": "gracia@uniai.example.com",
      "twelfthPct": 67,
      "status": "review",
      "sop": "I run a small online thrift store with my cousin and want to learn marketing and finance properly.",
      "createdAt": "2026-10-14T08:25:00.000Z",
      "updatedAt": "2026-10-14T08:25:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0005",
      "name": "Vijaya",
      "email": "vijaya@example.com",
      "phone": "9922613408",
      "programmeCode": "BTECH-AIML",
      "campusName": "Pune Lavasa",
      "officerEmail": "sheela@uniai.example.com",
      "twelfthPct": 79.4,
      "status": "shortlisted",
      "sop": "My school robotics team placed second at state level. I want to work on computer vision for assistive devices and learn from CHRIST faculty.",
      "createdAt": "2026-10-17T13:50:00.000Z",
      "updatedAt": "2026-10-24T09:30:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0006",
      "name": "Reeve",
      "email": "reeve@example.com",
      "phone": "9873016642",
      "programmeCode": "BBA",
      "campusName": "Yeshwanthpur, Bengaluru",
      "officerEmail": "gracia@uniai.example.com",
      "twelfthPct": 62,
      "status": "rejected",
      "sop": "I am interested in business and would like to learn management.",
      "createdAt": "2026-10-20T10:12:00.000Z",
      "updatedAt": "2026-10-27T16:45:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0007",
      "name": "Christina",
      "email": "christina@example.com",
      "phone": "9447728150",
      "programmeCode": "BALLB",
      "campusName": "Central Campus, Bengaluru",
      "officerEmail": "sheela@uniai.example.com",
      "twelfthPct": 85,
      "status": "review",
      "sop": "Debating taught me to argue both sides. I hope to study constitutional law, intern with a High Court advocate and eventually teach law.",
      "createdAt": "2026-10-25T12:00:00.000Z",
      "updatedAt": "2026-10-25T12:00:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0008",
      "name": "Joseph",
      "email": "joseph@example.com",
      "phone": "9567204319",
      "programmeCode": "BTECH-CSE",
      "campusName": "Kengeri, Bengaluru",
      "officerEmail": null,
      "twelfthPct": 73.6,
      "status": "review",
      "sop": "I enjoy building web apps for my college fest committee and want a deeper grounding in algorithms, databases and cloud computing.",
      "createdAt": "2026-10-29T17:20:00.000Z",
      "updatedAt": "2026-10-29T17:20:00.000Z"
    }
  ],
  "notes": [
    {
      "applicationNo": "CU-ADM-2026-0001",
      "officerEmail": "olivia@uniai.example.com",
      "body": "Strong project portfolio (crop-disease detection). Shortlisted for the AI & ML interview round.",
      "createdAt": "2026-10-05T10:30:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0001",
      "officerEmail": "olivia@uniai.example.com",
      "body": "Interview scheduled for next Tuesday, 11:00 am.",
      "createdAt": "2026-10-09T08:15:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0003",
      "officerEmail": "olivia@uniai.example.com",
      "body": "Legal-aid volunteering verified. Offer letter issued.",
      "createdAt": "2026-10-12T14:00:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0004",
      "officerEmail": "gracia@uniai.example.com",
      "body": "Marks are just above the cut-off. Waiting for the bridge-course consent form.",
      "createdAt": "2026-10-16T09:45:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0006",
      "officerEmail": "gracia@uniai.example.com",
      "body": "Percentage close to the cut-off and the statement of purpose is thin. Declined this cycle.",
      "createdAt": "2026-10-22T16:20:00.000Z"
    },
    {
      "applicationNo": "CU-ADM-2026-0005",
      "officerEmail": "sheela@uniai.example.com",
      "body": "Good fit for the Pune Lavasa AI lab. Shortlisted.",
      "createdAt": "2026-10-19T12:05:00.000Z"
    }
  ]
};
