# Blairify Enterprise – Product Overview

## What Blairify is

Blairify Enterprise is an online tool that helps companies run structured, remote job interviews.

Instead of scheduling live calls for every candidate, your team can:

- Create interview question sets for each role
- Send secure interview links to candidates
- Let candidates complete interviews in their own time
- Track who has started, completed, or missed their interview

---

## Who it is for

Blairify Enterprise is designed for:

- **People teams and HR** – to standardise interviews across the company
- **Hiring managers and recruiters** – to manage roles, candidates, and interview invites
- **Candidates** – to complete a fair, structured interview experience online

Different people inside a company can have different permission levels, for example:

- Company‑wide admins
- Organisation or department admins
- Recruiters

Candidates only see the interview portal.

Under the hood, Blairify uses a flexible permission tree, so companies can fine‑tune which people or teams can view, edit, or manage each part of the system (not just fixed roles).

---

## What you can do with it

### 1. Sign in and access your dashboard

- Create an account or log in with email and password
- Land in a dashboard that shows key interview activity at a glance

### 2. Manage job listings

- See a list of open roles
- View basic details like title, description, status, and number of candidates

### 3. Manage candidates

- See a list of candidates linked to your roles
- View high‑level details such as name, contact information, and interview status

### 4. Generate interview invites

This is the core idea of Blairify.

- Choose a candidate for a specific job
- Generate a unique interview link and access code
- Set how long the invite should stay valid (for example, 7 days)
- Share the link or code with the candidate by email or any messaging tool

Behind the scenes, the system connects the invite to:

- The company and organisation
- The job listing
- The candidate
- The set of interview questions for that job

### 5. Candidate interview experience

Candidates use the invite link or code to access the interview portal.

They can then:

- Confirm their name and email
- See the job title they are interviewing for
- Answer a series of structured questions on screen
- Move through the interview step by step until they finish

The product currently focuses on text answers and shows placeholders for future options like audio or video answers.

### 6. Review interview history

- See how many interviews are pending, in progress, completed, or expired
- Drill down by organisation, job, and candidate
- View when invites were created and when interviews were completed

This gives hiring teams a clear picture of where each candidate is in the process.

### 7. Test the candidate experience internally

There is also a "Test Interview" mode that lets team members:

- Pick a job
- Start a test interview
- Experience the interview flow as if they were a candidate

No real candidate data is affected by this.

---

## Data separation and security (high level)

- Each customer company has its own workspace inside Blairify Enterprise.
- Data is stored in a multi‑tenant database with **row‑level security (RLS)**, which means:
  - Users only see data for their own company and organisations.
  - Recruiters in one company cannot see candidates or jobs from another company.

Blairify Enterprise is accessed via [www.blairify.com](http://www.blairify.com) and runs at [enterprise.blairify.com](http://enterprise.blairify.com) with its own authentication system.

---

## How to think about the future product

When we rebuild from scratch, Blairify Enterprise should:

- Keep the same **core idea**: invite‑based, structured remote interviews
- Keep the **key flows**: job setup → candidate management → invite generation → candidate interview → history and reporting
- Replace demo data with real data everywhere
- Refine the design and wording so that non‑technical users can manage interviews with minimal training

This file is meant as a simple, non‑technical explanation for anyone reviewing the product or planning the next version.
