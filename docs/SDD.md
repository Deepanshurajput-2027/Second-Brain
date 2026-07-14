# SDD
📄 Software Design Description (SDD)
Software Design Description (SDD)
Second Brain
AI-Powered Knowledge Management & Discovery Platform
Document Information
Field	Value
Document	Software Design Description (SDD)
Version	1.0
Project	Second Brain
Architecture	Modular Service-Oriented Architecture
Development Methodology	Agile Scrum
Technology Stack	MERN + AI Microservices
Prepared By	Deepanshu Rajput
Status	Design Phase
Table of Contents
Executive Summary
High Level Design (HLD)
Low Level Design (LLD)
Database Architecture
Deployment Architecture
Engineering Decisions
Conclusion
1. Executive Summary
1.1 Introduction

Second Brain is an AI-powered knowledge management platform designed to help users capture, organize, discover, and revisit digital knowledge from a single centralized workspace.

Unlike traditional bookmarking systems that merely store URLs or files, the platform understands the semantic meaning of saved content and automatically enriches it through AI-driven processing.

The system transforms isolated knowledge resources into an interconnected knowledge network by combining semantic embeddings, contextual relationships, intelligent tagging, and graph visualization.

Users can save multiple forms of digital information—including articles, PDFs, YouTube videos, images, notes, and web pages—without worrying about manual organization.

Artificial Intelligence continuously processes newly added content in the background to generate embeddings, detect related topics, build knowledge relationships, and improve future search accuracy.

The resulting platform functions as a digital second brain that minimizes cognitive overhead while maximizing knowledge discoverability.

1.2 Architecture Goals

The architecture has been designed around the following engineering principles.

Scalability

Every major subsystem should be independently scalable.

Maintainability

Business logic should remain modular with clearly separated responsibilities.

Extensibility

Future AI capabilities should be integrated without requiring architectural redesign.

Reliability

Failures within AI processing should never interrupt the user experience.

Performance

Expensive AI computations should execute asynchronously.

Security

Authentication and authorization should follow modern security standards while protecting user-owned knowledge.

1.3 Architecture Style

The application follows a Modular Service-Oriented Architecture (SOA).

The system separates responsibilities into independent services:

Frontend Client
Backend API
AI Processing Service
Queue Workers
Database Layer
Vector Search Layer
Object Storage

Each subsystem communicates through well-defined interfaces, allowing future scaling and independent deployment.

2. High Level Design (HLD)
2.1 System Overview

Second Brain is composed of multiple independent services working together to deliver a responsive, AI-assisted knowledge management experience.

The architecture prioritizes responsiveness by separating user-facing operations from computationally expensive AI tasks.

Knowledge ingestion, semantic embedding generation, metadata extraction, and relationship discovery occur asynchronously through background workers, ensuring immediate feedback to users while AI enrichment continues independently.

2.2 Architecture Overview

The platform consists of the following major components.

Component	Responsibility
React Client	User Interface
Express API	Business Logic
Authentication Service	User Identity
Knowledge Service	Knowledge CRUD
AI Service	Embeddings & NLP
Queue Service	Background Processing
MongoDB	Primary Database
Qdrant	Vector Search
Cloudinary	File Storage
Upstash Redis	Queue Infrastructure
2.3 Architecture Style

The application adopts the following architectural principles.

Modular Architecture
Domain Driven Design
Service-Oriented Architecture
Event Driven Processing
RESTful Communication
Stateless APIs
Asynchronous AI Processing
2.4 Core Modules

The system is divided into business domains rather than technical layers.

Module	Responsibility
Authentication	Identity Management
Dashboard	User Workspace
Knowledge	Knowledge CRUD
Collections	Manual Organization
Search	Semantic Retrieval
Graph	Relationship Visualization
Memory	Resurfacing
AI	Content Enrichment
User	Preferences & Profile
2.5 High Level Architecture Diagram
graph TD

A[React Frontend]

B[Express API]

C[Authentication Module]

D[Knowledge Module]

E[Collections Module]

F[Search Module]

G[Graph Module]

H[Memory Engine]

I[BullMQ Queue]

J[Python AI Service]

K[MongoDB Atlas]

L[Qdrant Vector DB]

M[Cloudinary]

N[Upstash Redis]

A --> B

B --> C
B --> D
B --> E
B --> F
B --> G
B --> H

D --> I

I --> N

I --> J

J --> K

J --> L

D --> K

D --> M

F --> K

F --> L

G --> K
2.6 Major Components
React Frontend

Responsibilities

User Interface
State Management
Graph Rendering
API Communication
Express Backend

Responsibilities

Authentication
Business Logic
REST APIs
Validation
Queue Management
Python AI Service

Responsibilities

Content Processing
Metadata Extraction
Embedding Generation
Topic Detection
Relationship Discovery
MongoDB

Stores

Users
Knowledge Items
Collections
Notes
Highlights
Graph Relationships
Qdrant

Stores

Semantic Embeddings
Similarity Indexes
Cloudinary

Stores

PDFs
Images
Thumbnails
2.7 Technology Stack
Layer	Technology	Reason
Frontend	React + Vite	Fast development and excellent ecosystem
Styling	Tailwind CSS	Utility-first responsive design
State	Redux Toolkit	Predictable global state management
Visualization	D3.js	Interactive graph rendering
Backend	Express.js	Lightweight REST APIs
AI	FastAPI	High-performance Python APIs
Queue	BullMQ	Reliable background jobs
Database	MongoDB Atlas	Flexible document storage
Vector Search	Qdrant	High-performance similarity search
Object Storage	Cloudinary	Media management
Redis	Upstash	Queue backend and caching
Deployment	Vercel + Render	Free and production-ready deployment
2.8 Engineering Principles

The architecture follows the following principles throughout development.

Separation of Concerns

Each module owns a single business capability.

Loose Coupling

Modules communicate through interfaces instead of direct dependencies.

High Cohesion

Related functionality remains inside the same module.

AI First

Artificial Intelligence enhances every knowledge item automatically without interrupting user workflows.

Background Processing

Long-running AI operations execute asynchronously through queue workers.

Stateless APIs

Every request contains sufficient information for processing, enabling horizontal scalability.

User-Centric Design

System complexity remains hidden behind a clean, intuitive user experience.
2.9 System Context Diagram

The System Context Diagram illustrates the interaction between the primary user, the Second Brain platform, and external services. It defines the system boundary and highlights how information enters and leaves the platform.

graph LR

User((User))

SB[Second Brain Platform]

Cloudinary[(Cloudinary)]

Mongo[(MongoDB Atlas)]

Qdrant[(Qdrant Cloud)]

Redis[(Upstash Redis)]

AI[Python AI Service]

User -->|Login / Save Knowledge / Search| SB

SB --> Mongo

SB --> Cloudinary

SB --> Redis

Redis --> AI

AI --> Qdrant

AI --> Mongo

SB --> Qdrant

SB --> User
2.10 High-Level Component Architecture

The application follows a modular Service-Oriented Architecture where each business capability is encapsulated within its own domain.

graph TD

Frontend[React Frontend]

API[Express API]

Auth[Authentication]

Knowledge[Knowledge]

Collections[Collections]

Search[Search]

Graph[Knowledge Graph]

Memory[Memory Engine]

AIQueue[BullMQ Queue]

AIService[FastAPI AI Service]

Mongo[(MongoDB)]

Vector[(Qdrant)]

Storage[(Cloudinary)]

Frontend --> API

API --> Auth
API --> Knowledge
API --> Collections
API --> Search
API --> Graph
API --> Memory

Knowledge --> AIQueue

AIQueue --> AIService

AIService --> Mongo
AIService --> Vector

Knowledge --> Mongo

Knowledge --> Storage

Search --> Mongo
Search --> Vector

Graph --> Mongo
2.11 Data Flow Diagram (Level 0)

The Level 0 Data Flow Diagram presents the system as a single process and illustrates interactions with external entities.

flowchart LR

User((User))

SB((Second Brain))

DB[(MongoDB)]

AI((AI Service))

Storage[(Cloudinary)]

User -->|Knowledge Input| SB

SB --> DB

SB --> Storage

SB --> AI

AI --> DB

SB -->|Search Results| User
2.12 Data Flow Diagram (Level 1)

The Level 1 DFD expands the internal processing of the platform.

flowchart TD

A[User]

B[Knowledge Input]

C[Knowledge Service]

D[MongoDB]

E[BullMQ Queue]

F[Python AI Service]

G[Embedding Generation]

H[Metadata Extraction]

I[Relationship Detection]

J[Qdrant]

K[Knowledge Graph]

L[Search Engine]

M[Dashboard]

A --> B

B --> C

C --> D

C --> E

E --> F

F --> G

F --> H

F --> I

G --> J

H --> D

I --> K

J --> L

D --> L

L --> M

M --> A
2.13 Core Service Responsibilities
Service	Responsibility
Authentication Service	User identity and session management
Knowledge Service	CRUD operations for knowledge items
Collection Service	Manual organization of knowledge
Search Service	Keyword and semantic retrieval
AI Service	Metadata extraction, embeddings, topic detection
Memory Service	Periodic resurfacing of knowledge
Graph Service	Relationship discovery and visualization
Media Service	Upload and retrieval of images and PDFs
2.14 Request Processing Pipeline

Every user request follows a standardized lifecycle.

flowchart LR

Client

-->

Validation

-->

Authentication

-->

Business Logic

-->

Database

-->

Response

This pipeline ensures consistent validation, authentication, error handling, and logging across all APIs.

2.15 Knowledge Ingestion Architecture

The knowledge ingestion process is intentionally asynchronous to provide a responsive user experience.

flowchart LR

User

-->

React

-->

Express

-->

MongoDB

-->

BullMQ

-->

FastAPI

-->

Metadata

-->

Embedding

-->

Qdrant

-->

Relationship Detection

-->

Knowledge Graph
2.16 AI Processing Pipeline

The AI processing pipeline enriches every knowledge item after it has been stored.

flowchart TD

RawContent

-->

Cleaning

-->

Normalization

-->

Chunking

-->

Metadata Extraction

-->

Embedding Generation

-->

Topic Detection

-->

Relationship Discovery

-->

Vector Storage

-->

Knowledge Graph Update

-->

Completion
Processing Stages
Stage	Purpose
Cleaning	Remove unnecessary formatting and noise
Normalization	Standardize content
Chunking	Divide large documents into semantic units
Metadata Extraction	Extract title, summary, language, etc.
Embedding Generation	Convert text into vector representation
Topic Detection	Identify primary concepts
Relationship Discovery	Link similar knowledge items
Vector Storage	Store embeddings in Qdrant
Graph Update	Update relationships in MongoDB
2.17 Semantic Search Architecture

The platform implements Hybrid Search by combining lexical and semantic retrieval.

flowchart LR

Query

-->

Embedding

-->

Vector Search

-->

Keyword Search

-->

Ranking Engine

-->

Merged Results

-->

User
Search Workflow
User submits a natural language query.
The query is converted into an embedding.
Vector similarity search retrieves semantically related knowledge.
Keyword search retrieves lexical matches.
A ranking engine combines both result sets.
The final ranked list is returned to the user.
2.18 Knowledge Graph Architecture

The Knowledge Graph represents semantic relationships between knowledge items.

graph TD

React

React --> Hooks

Hooks --> JavaScript

JavaScript --> Frontend

Frontend --> WebDevelopment

React --> ReduxToolkit

ReduxToolkit --> StateManagement

Each node represents a Knowledge Item, while edges represent semantic relationships discovered through AI processing.

2.19 Feature Mapping
Feature	Primary Module	Supporting Services
Authentication	Auth	JWT, MongoDB
Knowledge	Knowledge	Cloudinary, BullMQ
Collections	Collections	MongoDB
Search	Search	Qdrant, MongoDB
Knowledge Graph	Graph	AI Service
Memory Resurfacing	Memory	Scheduler, MongoDB
Highlights	Knowledge	MongoDB
Notes	Knowledge	MongoDB
Dashboard	Dashboard	Analytics Service
2.20 Technology Justification
Technology	Justification
React	Component-based architecture with a mature ecosystem
Express.js	Lightweight REST API framework with excellent middleware support
FastAPI	High-performance Python framework for AI workloads
MongoDB Atlas	Flexible document storage suited for heterogeneous knowledge items
Qdrant	Purpose-built vector database for semantic search
BullMQ	Reliable asynchronous job processing
Upstash Redis	Managed Redis compatible with BullMQ
Cloudinary	Simplified media storage and delivery
D3.js	Rich, interactive graph visualizations
3. Low Level Design (LLD)
3.1 Overview

The Low-Level Design (LLD) describes the internal organization of the Second Brain platform and defines how individual software modules collaborate to implement the system designed in the High-Level Design.

Unlike the HLD, which focuses on interactions between services, the LLD specifies the internal architecture of the frontend, backend, AI service, data layer, and communication mechanisms.

The system follows a modular, domain-driven architecture that emphasizes maintainability, scalability, and separation of concerns.

3.2 Frontend Architecture

The frontend is implemented using a Four-Layer Architecture. Each layer has a single responsibility and communicates only with adjacent layers.

graph TD

UI[UI Components]

Hooks[Custom Hooks]

State[Redux Toolkit]

API[API Services]

UI --> Hooks
Hooks --> State
State --> API
Layer 1 — UI Components

The UI layer contains purely presentational React components.

Responsibilities:

Render UI
Receive props
Trigger events
Display loading states
Display errors

Rules:

No API calls
No business logic
No Redux logic
No data transformation

Example:

Button

Card

KnowledgeCard

CollectionCard

Navbar

Sidebar

SearchBar

GraphCanvas
Layer 2 — Custom Hooks

The Hooks layer contains reusable business logic.

Responsibilities:

Local state
Side effects
Graph calculations
Pagination
Infinite scrolling
Search debounce

Examples

useKnowledge()

useCollections()

useSearch()

useGraph()

useAuthentication()

useMemory()

useDashboard()
Layer 3 — State Management

Global application state is managed using Redux Toolkit.

Redux manages only shared application state.

Slices

authSlice

knowledgeSlice

collectionSlice

searchSlice

graphSlice

memorySlice

dashboardSlice

uiSlice
Layer 4 — API Layer

The API layer contains all communication with the backend.

Responsibilities

Axios configuration
Token refresh
Error handling
Request retry
Response transformation

Example

auth.service.js

knowledge.service.js

collection.service.js

graph.service.js

search.service.js

dashboard.service.js
3.3 Frontend Folder Structure
frontend/

src/

app/

components/

features/

auth/

knowledge/

collections/

dashboard/

graph/

search/

memory/

hooks/

services/

store/

layouts/

pages/

routes/

constants/

utils/

assets/

styles/

types/
3.4 Backend Architecture

The backend follows Domain Driven Modular Architecture instead of the traditional MVC folder structure.

Instead of

controllers/

routes/

models/

every business capability owns its complete implementation.

graph TD

Module

Controller

Service

Repository

Validator

Model

Routes

Module --> Controller

Module --> Service

Module --> Repository

Module --> Validator

Module --> Model

Module --> Routes
3.5 Backend Folder Structure
backend/

src/

config/

middleware/

modules/

auth/

knowledge/

collections/

search/

graph/

memory/

dashboard/

users/

shared/

database/

queues/

services/

utils/

app.js

server.js
Module Structure

Example

knowledge/

knowledge.controller.js

knowledge.service.js

knowledge.repository.js

knowledge.routes.js

knowledge.validator.js

knowledge.model.js

Each module owns its logic.

No module directly manipulates another module's database objects.

3.6 AI Service Architecture

The AI Service is completely independent.

Responsibilities

Text Cleaning
Metadata Extraction
Embedding Generation
Topic Detection
Relationship Discovery
Similarity Calculation
flowchart LR

Input

-->

Cleaning

-->

Chunking

-->

Embedding

-->

Metadata

-->

Relationship

-->

Output
3.7 AI Service Folder Structure
ai-service/

app/

routes/

services/

models/

workers/

embeddings/

clustering/

graph/

utils/

main.py
3.8 Queue Architecture

BullMQ manages every background AI task.

graph LR

Express

-->

BullMQ

-->

Redis

-->

Worker

-->

FastAPI

-->

MongoDB

-->

Qdrant

Benefits

Retry failed jobs
Parallel processing
Better user experience
Fault tolerance
3.9 Database Layer

The application stores different types of information using specialized storage systems.

Storage	Purpose
MongoDB	Primary document storage
Qdrant	Semantic embeddings
Cloudinary	Images & PDFs
Redis	Queue state & caching
3.10 Database Collections
Users

KnowledgeItems

Collections

CollectionItems

Tags

Highlights

Notes

GraphNodes

GraphEdges

SearchHistory

Notifications

MemoryQueue

UserPreferences

AIJobs

Each collection represents a single business entity.

3.11 Request Lifecycle

Every request follows the same execution pipeline.

sequenceDiagram

participant User

participant React

participant Express

participant Middleware

participant Controller

participant Service

participant Repository

participant MongoDB

User->>React: Action

React->>Express: API Request

Express->>Middleware: Authenticate

Middleware->>Controller: Pass Request

Controller->>Service: Execute

Service->>Repository: Query

Repository->>MongoDB: Database Operation

MongoDB-->>Repository: Result

Repository-->>Service: Data

Service-->>Controller: Response

Controller-->>React: JSON Response

React-->>User: UI Update
3.12 Knowledge Ingestion Sequence
sequenceDiagram

participant User

participant Frontend

participant Backend

participant Queue

participant AI

participant MongoDB

participant Qdrant

User->>Frontend: Save Knowledge

Frontend->>Backend: POST /knowledge

Backend->>MongoDB: Store Knowledge

Backend->>Queue: Create AI Job

Backend-->>Frontend: Success

Queue->>AI: Process Content

AI->>AI: Generate Metadata

AI->>AI: Generate Embedding

AI->>Qdrant: Store Vector

AI->>MongoDB: Update Knowledge
3.13 Semantic Search Sequence
sequenceDiagram

participant User

participant Frontend

participant Backend

participant AI

participant MongoDB

participant Qdrant

User->>Frontend: Search Query

Frontend->>Backend: Search

Backend->>AI: Query Embedding

AI->>Qdrant: Vector Search

Backend->>MongoDB: Keyword Search

MongoDB-->>Backend: Results

Qdrant-->>Backend: Similar Results

Backend->>Backend: Rank Results

Backend-->>Frontend: Final Response
3.14 Component Responsibilities
Component	Responsibility
Controller	HTTP request handling
Service	Business logic
Repository	Database operations
Validator	Input validation
Model	Data schema
Middleware	Authentication & authorization
Queue Worker	AI job execution
AI Service	Content enrichment
3.15 Error Handling Strategy

The backend follows centralized error handling.

Request

↓

Validation

↓

Authentication

↓

Business Logic

↓

Database

↓

Response

↓

Global Error Handler

Every error returns a standardized JSON response.

3.16 Logging Strategy

Application logs include:

API Requests
Authentication Events
Queue Jobs
AI Processing
Search Queries
Errors
System Warnings

Future enhancement:

Winston
OpenTelemetry
Grafana
Prometheus
3.17 Configuration Management

Environment variables are separated by service.

Example

frontend/.env

backend/.env

ai-service/.env

Secrets are never committed to version control.

3.18 Engineering Conventions

The project follows these engineering standards:

Feature-first architecture
Single Responsibility Principle (SRP)
Dependency Injection where appropriate
Stateless APIs
Consistent naming conventions
Reusable UI components
Shared utilities
Environment-based configuration
Modular business domains