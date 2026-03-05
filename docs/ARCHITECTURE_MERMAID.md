# SECLO Architecture - Mermaid Diagrams

## Complete System Architecture

```mermaid
graph TD
    %% User Input Layer
    AI[AI Interface<br/>React + TypeScript]
    CSV[CSV Upload<br/>Drag & Drop]
    
    %% Processing Layer
    Gemini[Gemini AI<br/>NL → JSON]
    Parser[CSV Parser<br/>Validate · Transform]
    Backend[Backend<br/>Risk · SQLite]
    
    %% Orchestration Layer
    CRE[Chainlink CRE<br/>Go Orchestration]
    
    %% CRE Components
    ConfHTTP[Conf. HTTP<br/>Secure Enclave]
    Compliance[Compliance<br/>Auth · Limits]
    Hoodi[Hoodi Blockchain<br/>ERC20 · Payments]
    
    %% Data & Monitoring
    EmployeeDB[Employee DB<br/>Off-chain · Private]
    VNet[Tenderly VNet<br/>Test · Debug]
    
    %% Flows
    AI -->|Natural Language| Gemini
    CSV -->|CSV File| Parser
    
    Gemini -->|JSON| Backend
    Parser -->|Parsed JSON| Backend
    
    Backend -->|HTTP Payload| CRE
    
    CRE -->|Fetch Registry| ConfHTTP
    CRE -->|Validate Rules| Compliance
    CRE -->|Execute Transfer| Hoodi
    
    ConfHTTP -->|Query| EmployeeDB
    Hoodi -->|Monitor Tx| VNet
    
    %% Styling
    classDef orange fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff
    classDef yellow fill:#fbbf24,stroke:#f59e0b,stroke-width:2px,color:#000
    classDef cyan fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff
    classDef blue fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    classDef purple fill:#a855f7,stroke:#9333ea,stroke-width:2px,color:#fff
    classDef mint fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef grey fill:#6b7280,stroke:#4b5563,stroke-width:2px,color:#fff
    
    class AI orange
    class Gemini yellow
    class CSV,Parser cyan
    class Backend,Hoodi blue
    class CRE,VNet purple
    class ConfHTTP,Compliance mint
    class EmployeeDB grey
```

---

## Simplified Flow Diagram

```mermaid
graph TD
    %% Input
    User[User Input<br/>AI or CSV]
    
    %% Processing
    Processing[Backend Processing<br/>Gemini AI + CSV Parser]
    
    %% Orchestration
    CRE[Chainlink CRE<br/>Workflow Orchestration]
    
    %% CRE Actions
    Privacy[Privacy Layer<br/>Conf. HTTP → Employee DB]
    Compliance[Compliance Check<br/>Auth + Limits]
    Blockchain[Blockchain Execution<br/>Hoodi Network]
    
    %% Monitoring
    Monitor[Tenderly VNet<br/>Testing & Monitoring]
    
    %% Flow
    User -->|Natural Language or CSV| Processing
    Processing -->|Structured JSON| CRE
    
    CRE --> Privacy
    CRE --> Compliance
    CRE --> Blockchain
    
    Blockchain --> Monitor
    
    %% Styling
    classDef input fill:#f97316,stroke:#ea580c,stroke-width:3px,color:#fff
    classDef process fill:#3b82f6,stroke:#2563eb,stroke-width:3px,color:#fff
    classDef orchestrate fill:#a855f7,stroke:#9333ea,stroke-width:3px,color:#fff
    classDef action fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef monitor fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    
    class User input
    class Processing process
    class CRE orchestrate
    class Privacy,Compliance,Blockchain action
    class Monitor monitor
```

---

## Privacy-Focused Architecture

```mermaid
graph TD
    %% Main Flow
    User[User Request]
    Backend[Backend API]
    CRE[Chainlink CRE]
    
    %% Privacy Components
    ConfHTTP[Confidential HTTP<br/>Secure Enclave]
    EmployeeDB[(Employee Database<br/>Names · Departments · Limits)]
    
    %% Compliance
    Compliance[Compliance Engine<br/>Authorization Check]
    
    %% Blockchain
    Blockchain[Hoodi Blockchain<br/>ERC20 Transfers]
    
    %% Flow
    User -->|Pay Alice 5000| Backend
    Backend -->|Structured Batch| CRE
    
    CRE -->|Secure Request| ConfHTTP
    ConfHTTP -->|Encrypted Query| EmployeeDB
    EmployeeDB -->|Private Data| ConfHTTP
    ConfHTTP -->|Validation Data| CRE
    
    CRE -->|Check Rules| Compliance
    Compliance -->|Approved/Rejected| CRE
    
    CRE -->|Authorized Only| Blockchain
    
    %% Privacy Boundary
    subgraph Privacy["🔒 Privacy Layer - Off-Chain"]
        ConfHTTP
        EmployeeDB
    end
    
    subgraph Public["🔗 Public Layer - On-Chain"]
        Blockchain
    end
    
    %% Styling
    classDef private fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff
    classDef public fill:#3b82f6,stroke:#2563eb,stroke-width:3px,color:#fff
    classDef orchestrate fill:#a855f7,stroke:#9333ea,stroke-width:3px,color:#fff
    
    class ConfHTTP,EmployeeDB private
    class Blockchain public
    class CRE orchestrate
```

---

## CRE Workflow Detail

```mermaid
graph TD
    %% Trigger
    Trigger[HTTP Trigger<br/>Payroll Batch]
    
    %% CRE Steps
    Parse[Parse Input<br/>Validate JSON]
    FetchRegistry[Fetch Employee Registry<br/>Confidential HTTP]
    ValidateAuth[Validate Authorization<br/>Check Allowlist]
    ValidateAmount[Validate Amount<br/>Check Limits]
    ExecuteTransfer[Execute ERC20 Transfer<br/>For Each Employee]
    FormatResults[Format Results<br/>Return Summary]
    
    %% External Systems
    EmployeeAPI[Employee Registry API<br/>Backend Endpoint]
    HoodiChain[Hoodi Blockchain<br/>Smart Contract]
    
    %% Flow
    Trigger --> Parse
    Parse --> FetchRegistry
    FetchRegistry -->|Confidential HTTP| EmployeeAPI
    EmployeeAPI -->|Employee Data| FetchRegistry
    FetchRegistry --> ValidateAuth
    ValidateAuth -->|Authorized?| ValidateAmount
    ValidateAmount -->|Within Limit?| ExecuteTransfer
    ExecuteTransfer -->|ERC20 Transfer| HoodiChain
    HoodiChain -->|Tx Hash| ExecuteTransfer
    ExecuteTransfer --> FormatResults
    
    ValidateAuth -->|Rejected| FormatResults
    ValidateAmount -->|Rejected| FormatResults
    
    %% Styling
    classDef trigger fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff
    classDef process fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    classDef privacy fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef blockchain fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    
    class Trigger trigger
    class Parse,ValidateAuth,ValidateAmount,FormatResults process
    class FetchRegistry,EmployeeAPI privacy
    class ExecuteTransfer,HoodiChain blockchain
```

---

## Data Privacy Flow

```mermaid
graph LR
    %% What Goes Where
    subgraph OnChain["⛓️ ON-CHAIN (Public)"]
        WalletAddr[Wallet Addresses]
        Amounts[Payment Amounts]
        TxHash[Transaction Hashes]
        Status[Success/Failure Status]
    end
    
    subgraph OffChain["🔒 OFF-CHAIN (Private)"]
        Names[Employee Names]
        Departments[Departments]
        Limits[Salary Limits]
        Rules[Authorization Rules]
    end
    
    subgraph CRE["Chainlink CRE<br/>Secure Compute"]
        Validation[Validation Logic]
    end
    
    OffChain -->|Confidential HTTP| CRE
    CRE -->|Only Decisions| OnChain
    
    %% Styling
    classDef public fill:#3b82f6,stroke:#2563eb,stroke-width:3px,color:#fff
    classDef private fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff
    classDef secure fill:#a855f7,stroke:#9333ea,stroke-width:3px,color:#fff
    
    class WalletAddr,Amounts,TxHash,Status public
    class Names,Departments,Limits,Rules private
    class Validation secure
```

---

## Technology Stack Diagram

```mermaid
graph TD
    %% Frontend
    subgraph Frontend["Frontend Layer"]
        React[React + TypeScript]
        Router[React Router]
        UI[AI Interface + CSV Upload]
    end
    
    %% Backend
    subgraph Backend["Backend Layer"]
        Express[Express.js]
        Gemini[Gemini AI]
        SQLite[SQLite Database]
        RiskService[Risk Service]
    end
    
    %% Blockchain
    subgraph Blockchain["Blockchain Layer"]
        CRE[Chainlink CRE<br/>Go Runtime]
        ConfHTTP[Confidential HTTP]
        Hoodi[Hoodi Network<br/>Chain ID: 40875]
        SCLO[SCLO Token<br/>ERC20]
    end
    
    %% Testing
    subgraph Testing["Testing & Monitoring"]
        VNet[Tenderly Virtual TestNet]
        Explorer[Transaction Explorer]
        Debugger[Gas Profiler & Debugger]
    end
    
    %% Connections
    Frontend --> Backend
    Backend --> CRE
    CRE --> ConfHTTP
    CRE --> Hoodi
    Hoodi --> SCLO
    Hoodi --> VNet
    VNet --> Explorer
    VNet --> Debugger
    
    %% Styling
    classDef frontend fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff
    classDef backend fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    classDef blockchain fill:#a855f7,stroke:#9333ea,stroke-width:2px,color:#fff
    classDef testing fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    
    class React,Router,UI frontend
    class Express,Gemini,SQLite,RiskService backend
    class CRE,ConfHTTP,Hoodi,SCLO blockchain
    class VNet,Explorer,Debugger testing
```

---

## How to Use These Diagrams

### For PowerPoint:
1. Go to https://mermaid.live
2. Copy any diagram code above
3. Paste into the editor
4. Export as PNG or SVG
5. Insert into your PowerPoint slides

### For GitHub README:
- GitHub supports Mermaid natively
- Just paste the code blocks into your README.md
- They'll render automatically

### For Documentation:
- Use the "Complete System Architecture" for overview
- Use "Privacy-Focused Architecture" for privacy explanation
- Use "CRE Workflow Detail" for technical deep dive
- Use "Data Privacy Flow" for compliance discussion

---

## Recommended Diagram per Slide

**Slide 4 (Architecture Overview):**
- Use "Complete System Architecture"

**Slide 6 (Privacy Features):**
- Use "Data Privacy Flow"

**Slide 5 (CRE Integration):**
- Use "CRE Workflow Detail"

**Slide 11 (Technical Highlights):**
- Use "Technology Stack Diagram"

---

All diagrams are corrected with proper connections:
- ✅ Conf. HTTP → Employee DB (not CRE → Employee DB)
- ✅ Hoodi → Tenderly VNet (monitoring relationship)
- ✅ All labels and flows accurate
