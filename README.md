# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
````markdown
# UniPath AI 🎓
## Personalized AI Admission Assistant for International Students

![UniPath AI Logo](./assets/logo.png)

---

# Project Overview

UniPath AI is an AI-powered educational platform designed to help students prepare for international university admission.

The main goal of our project is to transform the complicated admission process into a personalized and understandable journey.

Instead of searching through hundreds of university websites and trying to understand complex requirements independently, students receive an individual roadmap based on their own profile.

UniPath AI analyzes:

- Academic performance
- IELTS/SAT results
- Desired major
- Budget limitations
- Achievements
- Portfolio and extracurricular activities

Based on this information, the system provides:

- Personalized university recommendations
- Admission requirement analysis
- Strength and weakness identification
- Individual preparation roadmap

---

# 1. Problem

## The challenge of university admission

Every year, thousands of students dream about studying at international universities. However, many of them face the same difficulties:

- University requirements are scattered across different websites;
- Students do not understand whether their current profile is suitable;
- They receive general advice instead of personalized guidance;
- Creating a preparation strategy requires a lot of time and research.

Students often hear:

"Improve your English."

"Get higher grades."

"Build your portfolio."

However, the most important question remains:

**"What exactly should I do based on my current situation?"**

UniPath AI was created to solve this problem.

---

# 2. Solution

## Personalized AI Admission Assistant

UniPath AI creates a personalized admission journey for every student.

The user creates a profile by completing a short questionnaire.

The system collects:

- IELTS score;
- SAT score;
- GPA;
- Academic interests;
- Financial capabilities;
- Career goals;
- Previous achievements.

After analyzing this information, AI generates personalized recommendations.

The user receives:

✅ Suitable universities  
✅ Match analysis  
✅ Required improvements  
✅ Step-by-step preparation roadmap  

Our main idea:

**Not just finding universities, but showing students how to reach them.**

---

# 3. Main Features

## Personalized Profile

Students create their admission profile through an interactive questionnaire.

Example:

```json
{
"IELTS": 7.5,
"SAT": 1450,
"GPA": 3.8,
"Major": "Computer Science",
"Budget": 20000
}
````

The profile becomes the foundation for AI analysis.

---

## AI University Matching

UniPath AI compares the student's profile with university requirements.

The system evaluates:

* Academic compatibility;
* English requirements;
* Standardized tests;
* Financial factors.

The result is presented as:

### Strong Match

The student's profile fits university requirements.

### Competitive

The student has potential but needs improvement.

### Reach

The university requires significant profile development.

---

## University Comparison

Students can compare universities based on:

* Admission requirements;
* Tuition fees;
* Scholarships;
* Personal compatibility.

The comparison considers the student's individual profile.

---

## My Path

The AI creates a personalized roadmap.

Example:

```
September:
Improve IELTS Writing skills

October:
Create Computer Science portfolio project

November:
Prepare application documents

December:
Search scholarships
```

The roadmap helps students understand their next actions.

---

## Preparation Assistant

The preparation section provides personalized recommendations.

AI suggests:

* Learning resources;
* Preparation strategies;
* Academic improvement areas;
* Portfolio development ideas.

---

# 4. System Architecture

```
                 USER

                   ↓

            Questionnaire

                   ↓

          Student Profile

                   ↓

             Supabase DB

                   ↓

              AI Engine

                   ↓

       Personalized Analysis

                   ↓

   --------------------------------

   University     Compare     My Path

   Matching                  Roadmap
```

---

# 5. Technology Stack

## Frontend

### React Native

Used for creating the mobile application interface.

Advantages:

* Cross-platform development;
* Fast prototyping;
* Modern user experience.

### Expo

Used for:

* Application development;
* Testing;
* Mobile deployment.

### TypeScript

Used for:

* Type safety;
* Better code reliability;
* Easier maintenance.

---

## Backend

### Supabase

Supabase provides backend infrastructure.

Used for:

* User authentication;
* Database management;
* Profile storage;
* Server communication.

Components:

* Supabase Authentication;
* Supabase Database;
* Supabase Edge Functions.

---

## Artificial Intelligence

### OpenAI API

AI functionality is powered by OpenAI API.

Used for:

* Profile analysis;
* University recommendations;
* Roadmap generation;
* Personalized feedback.

---

# 6. AI Integration

The AI module receives structured user information.

Example:

```json
{
"student":{
"IELTS":7.5,
"SAT":1450,
"GPA":3.8,
"major":"Engineering"
}
}
```

The AI analyzes:

* Student strengths;
* Missing requirements;
* Improvement areas;
* Possible strategies.

Example output:

```
University:
Strong Match

Strength:
Strong academic background

Improvement:
Increase research experience
```

---

# 7. Installation and Launch Instructions

## Requirements

Install:

* Node.js
* npm
* Expo Go application

---

## Clone repository

```bash
git clone <repository-link>
```

Move to project folder:

```bash
cd UniPath
```

Install dependencies:

```bash
npm install
```

Start application:

```bash
npx expo start
```

For external network testing:

```bash
npx expo start --tunnel
```

Open Expo Go and scan the QR code.

---

# 8. Testing Scenario

## Scenario 1 — Creating Profile

User enters:

```
IELTS: 7.5

SAT: 1450

GPA: 3.8

Major:
Computer Science
```

Expected result:

The profile is successfully saved.

---

## Scenario 2 — University Analysis

User opens Universities page.

System:

* Reads profile data;
* Compares requirements;
* Generates compatibility analysis.

Expected result:

User receives personalized university recommendations.

---

## Scenario 3 — Roadmap Generation

User opens My Path.

AI creates:

* Goals;
* Tasks;
* Preparation strategy.

---

# 9. Team Roles

## Frontend Development

Responsible for:

* Mobile application interface;
* User experience;
* Navigation;
* UI components.

## AI Development

Responsible for:

* AI integration;
* Prompt engineering;
* Recommendation logic.

## Research & Product Development

Responsible for:

* Problem analysis;
* User research;
* Product strategy.

---

# 10. Sources

Official documentation used:

* React Native Documentation
* Expo Documentation
* Supabase Documentation
* OpenAI API Documentation

University information sources:

* Official university websites
* Public admission requirement pages

---

# 11. Ready Components

The project uses existing technologies and libraries:

* React Native UI components;
* Expo Router navigation;
* Supabase authentication;
* Supabase database;
* OpenAI API integration.

These components allowed us to focus on building the personalized admission experience.

---

# 12. Limitations

## University Database

The current version uses a prepared university database.

Future versions will integrate automatically updated official university information.

## AI Accuracy

AI provides recommendations and analysis but cannot guarantee admission results.

## Internet Dependency

AI features require an active internet connection.

---

# 13. Future Development

Future improvements:

🚀 Automatic university requirement updates

🚀 AI analysis of motivation letters

🚀 Interview preparation assistant

🚀 Portfolio evaluation

🚀 Scholarship recommendation system

🚀 Integration with official university platforms

---

# Conclusion

UniPath AI combines artificial intelligence and education technology to simplify international university admission.

Our mission is to help students understand:

* where they are now;
* where they want to go;
* what steps they need to take.

**UniPath AI — Your personalized journey to your dream university. 🚀**

```
```
