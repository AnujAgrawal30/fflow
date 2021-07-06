# FFlow.ninja
### Become a Financial Flow Ninja!

**An entry for the Formula 0001: Rapyd Fintech Grand Prix**

With ❤ From Milan 🍕, By Eng. Domingo Lupo

## What it is?
FFlow.ninja is a visual editor for creating financial flows. 
It works by dragging and dropping blocks and then connecting them to create 
a business logic, by describing the process rather than coding it.

## Why?
Working for almost a decade in fintech I realize that no financial flow 
in the early stages of design is made by developers, instead is 
conceptualize by non-technical profiles, like business people, marketing, 
sales, etc. After the business logic is set, then developers translate 
*the idea* into code.

FFlow works by converting *the idea* into an application without having 
to write code relying on Visual Scripting and the Rapyd API.

## Marketing presentation
insert video here

## Pitch 
insert video here

## Demo/Tutorial
insert video here

## Tech Stack
- NodeJS
- ExpressJS
- MongoDB
- Agenda (Queue Worker)
- litegraph.js (Graphic engine, heavily modified to work with Rapyd)
- **Rapyd API Node SDK** (Made from scratch for this project)
- PM2

![High level overview](https://fflow.ninja/_/tech.png)



### Website (Private Alpha)
[htts://fflow.ninja](htts://fflow.ninja)

You can use a demo account:

**user**: rapyd@test.com

**password**: Password123!

Or you can create a new account using the **invitation code**: **rapyd0001**

**Disclaimer: This is an alpha build, there some bugs I'm still working on, so be patience ✌**


## Run it locally

- Pull the repo
- npm i
- npm run buildApp
- npm run buildSite
- node worker
- node index

You'll need to prepare a .env file with a few credentials. 
Take a look on the .env.example file
to know what is necessary.
