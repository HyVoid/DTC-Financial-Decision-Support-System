# DTC Financial Decision Support System (FDSS)

### Excel & Browser-Based Financial Control, Cash Flow Forecasting, Reconciliation, and Operational Decision Support for Shopify Brands

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-success.svg)
![Tool](https://img.shields.io/badge/Tool-Decision%20Support-orange.svg)

**A lightweight financial operating system that transforms Shopify sales, bank transactions, accounting records, inventory purchasing, and advertising spend into a single decision framework—availabl[...]**

> ## **No signup. No installation. Free.**
>
> 🌐 **Open in Browser**  
> *(HTML Live Demo — Coming Soon)*
>
> 📥 **Download Excel Version**  
> *(GitHub Release / Gumroad — Coming Soon)*

---

# Screenshots

### Browser Version

<!-- screenshot: browser version -->

*Interactive executive dashboard showing cash position, reconciliation exceptions, payment risks, advertising spend, and projected liquidity.*

---

### Excel Version

<!-- screenshot: excel version -->

*Native Excel workbook with automated reconciliation engine, rolling cash flow forecasting, inventory simulation, and executive reporting.*

---

# What It Helps You Track

- Real cash position instead of simply checking the current bank balance.
- Shopify settlements that never reached the bank before they become accounting problems.
- Duplicate invoice and payment risks before money leaves the business.
- Future cash shortages created by purchasing inventory weeks before they occur.
- Advertising spend alongside incoming settlements to understand operational liquidity rather than isolated marketing costs.
- Inventory purchasing decisions and their impact on future working capital under different payment terms.

---

# Quick Start Workflow

### 1. Configure business parameters once

Open the **Parameters** sheet and define operational settings such as the minimum cash reserve, reporting currency, exchange rates, forecast horizon, and other business thresholds. These values become[...]

---

### 2. Import existing business data

Paste exported CSV files directly into the designated input sheets.

Typical sources include:

- Shopify Orders & Payouts
- Bank Statements
- Accounting System Exports
- Purchase Orders
- Facebook Ads
- Google Ads

No manual restructuring or formula editing is required. Existing exports from accounting software or spreadsheets can be pasted directly into the corresponding tables.

---

### 3. Review automatic analysis

Open the dashboard and analytical sheets.

The workbook immediately updates:

- reconciliation exceptions
- duplicate payment alerts
- rolling cash flow forecasts
- inventory funding pressure
- executive KPIs

No manual calculations are required.

---

### 4. Refresh on a regular schedule

Update imported data weekly or monthly by replacing the source tables with the latest exports.

All calculations, forecasts, charts, and risk indicators refresh automatically without rebuilding the workbook.

**Set a few key parameters. Drop in your existing data. Get the analysis. Refresh when you need to.**

---

# Why I Built This

Many growing Shopify brands believe they have financial visibility because they have accounting software, bank balances, and sales dashboards.

In reality, these systems answer different questions.

Accounting explains what already happened.

Shopify explains what customers purchased.

Banks show where cash currently sits.

Advertising platforms explain where money was spent.

None of them explain whether today's operational decisions will create a cash problem six weeks from now.

That analytical gap causes expensive mistakes.

Inventory is ordered because sales look strong.

Advertising budgets increase because revenue is growing.

Supplier payments are approved because the current bank balance appears healthy.

Only later does the business discover that settlement timing, inventory deposits, advertising costs, and outstanding invoices overlap to create a liquidity shortage.

I built this workbook as a reusable decision framework rather than another reporting spreadsheet.

Instead of reviewing disconnected reports, the workbook combines operational data into one financial reasoning model.

For example:

**Before**

A Shopify store reports $480,000 in monthly revenue.

Management approves a $150,000 inventory purchase.

Three weeks later, advertising invoices, supplier deposits, and delayed Shopify payouts reduce available cash below payroll requirements.

---

**After**

The same purchase is entered into the Inventory Impact Simulator before approval.

The workbook immediately forecasts that Week 7 cash will fall below the configured safety reserve.

Management delays part of the purchase by two weeks and negotiates revised supplier payment terms.

Revenue remains unchanged.

Cash risk disappears.

The objective is not better reporting.

The objective is better decisions before cash problems become operational emergencies.

---

# Common DTC Finance Problems This Solves

| Problem | Without This Tool | With This Tool |
|-----------|------------------|----------------|
| Shopify payouts do not reconcile with bank deposits | Finance teams manually search hundreds of transactions | Automatic reconciliation highlights unmatched settlements immediately |
| Duplicate supplier payments | Duplicate invoices are discovered after money has already been sent | Payment review flags duplicate invoice numbers before payment approval |
| Cash shortages appear unexpectedly | Decisions rely on today's bank balance | Rolling forecasts estimate future cash positions over the next 12 weeks |
| Inventory purchasing exceeds working capital | Purchasing decisions ignore future obligations | Inventory simulations estimate liquidity impact before approving purchase orders |
| Advertising spend grows faster than incoming cash | Marketing and finance work from separate reports | Advertising costs and settlement inflows appear in one forecasting model |
| Executive reporting requires multiple systems | Decision makers assemble information manually | Financial Dashboard summarizes operational KPIs in one view |

---

# Who This Is For

This workbook is designed for:

- Shopify and DTC brands managing increasing operational complexity.
- Finance managers responsible for cash planning and reconciliation.
- CFOs requiring forward-looking liquidity analysis instead of historical reporting.
- Operations teams coordinating purchasing, inventory, and payment timing.
- Founders who need one operational view across sales, accounting, banking, inventory, and marketing.

It is **not** designed to replace ERP systems, accounting software, or enterprise treasury platforms.

Instead, it provides a lightweight decision-support framework that connects existing operational data into a practical financial control process.

No spreadsheet expertise is required. Open the browser version or Excel workbook, import existing exports, and begin reviewing operational insights immediately.

---

# About

I build lightweight Excel and browser-based decision-support tools for operational environments where too many moving parts make reliable decisions difficult.

Each workbook starts with one practical question: 
> "What information needs to exist in one place before the next decision can be made confidently?" 
---

# Technical Details

<details>
<summary><strong>For technical reviewers, Excel practitioners, and collaborators</strong></summary>

---

# Workbook Architecture

The workbook follows a strict three-layer architecture that separates raw data, analytical logic, and executive reporting. Every sheet has a single responsibility, making the workbook easier to audit,[...]

```
                ┌────────────────────────────┐
                │        Data Input          │
                └─────────────┬──────────────┘
                              │
     Shopify Orders           │
     Bank Transactions        │
     Accounting Entries       │
     Purchase Orders          │
     Advertising Spend        │
     Parameters               │
                              ▼
      ┌───────────────────────────────────────────┐
      │      Analytical Calculation Layer         │
      │                                           │
      │ Reconciliation Engine                     │
      │ Payment Review                            │
      │ Cash Flow Forecast                        │
      │ Inventory Impact Simulator                │
      └───────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────┐
              │ Executive Dashboard (CEO) │
              └───────────────────────────┘
```

---

## Workbook Structure

| Sheet | Purpose | Layer |
|---------|----------|---------|
| Parameters | Global business settings and thresholds | Input |
| Shopify_Data | Shopify orders, refunds, payouts | Input |
| Bank_Transactions | Bank and payment platform statements | Input |
| Accounting_Data | Ledger entries and invoices | Input |
| Inventory_Purchases | Purchase orders and payment schedules | Input |
| Advertising_Spend | Marketing costs by date and platform | Input |
| Reconciliation_Engine | Cross-system settlement matching | Analysis |
| Payment_Review | Duplicate payment detection | Analysis |
| Cash_Flow_Forecast | Rolling liquidity projection | Analysis |
| Inventory_Impact_Simulator | Purchasing stress testing | Analysis |
| Financial_Dashboard | Executive KPI reporting | Presentation |

---

## Data Flow

```
Shopify
        \
Bank -----\
            \
Accounting ---> Reconciliation Engine
                  │
Inventory --------│
                  │
Advertising ------│
                  │
Parameters -------│
                  ▼
       Cash Flow Forecast
                  │
                  ▼
 Inventory Impact Simulator
                  │
                  ▼
       Financial Dashboard
```

The workbook intentionally prevents direct reporting from raw data.

Every KPI originates from validated analytical sheets instead of imported tables.

This reduces hidden calculation errors and makes the analytical process reproducible.

---

## Validation Flow

```
Import CSV

      │

      ▼

Excel Tables

      │

      ▼

Dynamic Array Calculations

      │

      ▼

Exception Detection

      │

      ▼

Forecast Generation

      │

      ▼

Executive Dashboard
```

Every calculation depends on structured Excel Tables rather than static ranges.

As source data grows, calculations automatically expand without copying formulas.

---

# Three Traps That Catch Even Experienced Finance Teams

---

## Trap 1 — Assuming Today's Bank Balance Represents Available Cash

### The Decision

Management approves a $180,000 inventory order because the bank currently contains $420,000.

---

### Hidden Assumption

The bank balance ignores:

- supplier deposits due next week
- advertising invoices
- delayed Shopify settlements
- outstanding operating expenses

The number is correct.

The decision is not.

---

### Incorrect Recommendation

```
Cash Today

$420,000

Inventory Cost

$180,000

Remaining Cash

$240,000

Decision

Approve Purchase
```

The purchase appears affordable.

---

### Why This Reasoning Fails

Cash timing matters more than cash balance.

Three weeks later:

- supplier balance payment
- advertising invoices
- payroll
- delayed settlement timing

all occur simultaneously.

Working capital becomes negative despite today's healthy balance.

---

### Correct Approach

The workbook projects future liquidity using:

- settlement timing
- purchasing schedule
- advertising spend
- historical cash movements
- configurable safety reserve

Decision quality improves because future obligations become visible before money is committed.

---

### Correct Decision

```
Week 1

$420k

Week 4

$275k

Week 7

$82k

Safety Reserve

$100k

Recommendation

Delay Purchase
```

Management delays the purchase by two weeks.

Sales remain unchanged.

Cash risk disappears.

<details>

<summary>Formula Reference</summary>

```excel
=LET(
min_cash,
XLOOKUP(
"Safety_Cash_Reserve",
Parameters[Param_Name],
Parameters[Param_Value],
50000
),
...
)
```

The formula evaluates projected liquidity before both deposit and final payment events.

</details>

---

## Trap 2 — Treating Every Shopify Settlement as Successfully Collected

### The Decision

Finance assumes every completed Shopify order has reached the company's bank account.

Revenue reports appear correct.

Cash appears correct.

Neither assumption is verified.

---

### Hidden Assumption

Orders

≠

Cash Received

Settlement delays, partial payments, payment processor adjustments, refunds, and banking issues frequently create differences.

Without automated reconciliation these exceptions remain hidden.

---

### Incorrect Recommendation

```
Shopify Revenue

$615,000

Expected Cash

$615,000

Decision

Cash Collection Complete
```

---

### Why This Reasoning Fails

Multiple settlements may belong to one order.

One settlement may contain multiple orders.

Refund timing may differ from settlement timing.

Manual matching quickly becomes unreliable.

---

### Correct Approach

The workbook constructs a unique order list and independently calculates:

- Shopify Net Payment
- Bank Settled Amount
- Variance
- Matching Status

Only reconciled transactions contribute to executive reporting.

---

### Correct Decision

| Order | Shopify | Bank | Result |
|---------|----------|---------|---------|
| 10541 | $245 | $245 | Match |
| 10542 | $310 | $280 | Variance |
| 10543 | $180 | $0 | Missing Settlement |

Finance investigates only the highlighted exceptions rather than reviewing every transaction.

<details>

<summary>Formula Reference</summary>

```excel
=UNIQUE(
FILTER(
Shopify_Data[Order ID],
Shopify_Data[Order ID]<>""))
```

```excel
=MAP(
A2#,
LAMBDA(order_id,
SUMIFS(
Bank_Transactions[Amount],
Bank_Transactions[Reference ID],
order_id
)))
```

```excel
=B2#-C2#
```

These formulas create a fully dynamic reconciliation engine with no copied formulas.

</details>

---

## Example Scenario (Part 1)

Imagine a growing Shopify brand generating approximately **USD 520,000 in monthly revenue**.

Current operating conditions include:

| Item | Value |
|-------|---------:|
| Current Bank Balance | $468,000 |
| Outstanding Purchase Order | $210,000 |
| Deposit Required | 30% |
| Remaining Supplier Payment | 70% |
| Weekly Advertising Spend | $34,000 |
| Safety Cash Reserve | $100,000 |
| Average Shopify Settlement Delay | 4 Days |

At first glance, management concludes that sufficient liquidity exists to approve the purchase order immediately.

The Inventory Impact Simulator produces a different picture.

The required supplier deposit reduces immediately available cash.

Over the following weeks, advertising commitments continue while the remaining supplier balance becomes due before all Shopify settlements have cleared.

Rather than evaluating only today's cash balance, the workbook models the timing of each major cash inflow and outflow across the next twelve weeks.

The resulting projection shows that available cash briefly falls below the configured operating reserve during Week 7, despite ending the quarter with a positive cash balance.

Instead of cancelling the purchase entirely, management can explore operational alternatives:

- negotiate revised supplier payment terms,
- split the purchase order into two shipments,
- delay part of the advertising campaign,
- or postpone the second production run until settlement receipts arrive.

The recommendation is therefore not simply **"buy"** or **"don't buy."**

It becomes **"buy under payment terms that preserve minimum operating liquidity."**

That distinction is exactly where operational decision support creates value.

---

## Example Scenario (Part 2)

<details>
<summary>Example Scenario (Part 2) — details for technical reviewers</summary>

The CFO reviews the forecast before approving the supplier payment.

The projected cash movement now looks like this:

| Week | Opening Cash | Cash In | Cash Out | Ending Cash |
|------|-------------:|---------:|----------:|------------:|
| Week 1 | $468,000 | $92,400 | $97,600 | $462,800 |
| Week 2 | $462,800 | $118,300 | $121,900 | $459,200 |
| Week 3 | $459,200 | $86,700 | $158,500 | $387,400 |
| Week 4 | $387,400 | $95,800 | $144,600 | $338,600 |
| Week 5 | $338,600 | $101,400 | $129,700 | $310,300 |
| Week 6 | $310,300 | $84,900 | $176,200 | $219,000 |
| Week 7 | $219,000 | $73,600 | $196,800 | **$95,800** |
| Week 8 | $95,800 | $168,700 | $118,500 | $146,000 |
| Week 9 | $146,000 | $179,100 | $136,700 | $188,400 |
| Week10 | $188,400 | $161,200 | $119,500 | $230,100 |
| Week11 | $230,100 | $156,300 | $121,800 | $264,600 |
| Week12 | $264,600 | $170,500 | $135,700 | $299,400 |

The dashboard immediately highlights Week 7 because projected liquidity falls below the configured **$100,000 Safety Cash Reserve**.

Rather than discovering the issue after payments have already been released, finance identifies the constraint six weeks in advance.

Management evaluates three alternatives.

| Alternative | Forecast Result |
|-------------|----------------|
| Approve purchase immediately | Week 7 liquidity falls below reserve |
| Delay supplier balance payment by 14 days | Cash reserve remains above threshold |
| Split purchase into two production batches | Liquidity remains stable while inventory risk decreases |

The second option provides the strongest balance between operational continuity and financial safety.

This illustrates an important design philosophy of the workbook:

The objective is **not** to maximize cash.

The objective is to preserve decision flexibility by identifying future liquidity constraints before they become operational problems.

</details>

---

## Formula Reference

<details>
<summary><strong>Parameters</strong></summary>

| Formula | Purpose |
|---------|----------|
| `XLOOKUP()` | Retrieve configurable business parameters. |
| Named Excel Tables | Centralize configuration without hardcoded values. |

Typical Parameters include:

- Safety Cash Reserve
- Exchange Rate
- Forecast Horizon
- Default Payment Terms
- Reporting Currency

</details>

<details>
<summary><strong>Reconciliation Engine</strong></summary>

### Dynamic Order List

```excel
=UNIQUE(
FILTER(
Shopify_Data[Order ID],
Shopify_Data[Order ID]<>""))
```

Creates a continuously expanding reconciliation index.

---

### Shopify Net Amount

```excel
=MAP(
A2#,
LAMBDA(order_id,
XLOOKUP(
order_id,
Shopify_Data[Order ID],
Shopify_Data[Net Payment],
0)))
```

Returns Shopify settlement values.

---

### Bank Settlement

```excel
=MAP(
A2#,
LAMBDA(order_id,
SUMIFS(
Bank_Transactions[Amount],
Bank_Transactions[Reference ID],
order_id)))
```

Aggregates multiple settlements belonging to one order.

---

### Variance

```excel
=B2#-C2#
```

Calculates reconciliation differences.

---

### Status Classification

```excel
=MAP(
D2#,
LAMBDA(diff,
IFS(
diff=0,
"Matched",
ABS(diff)<0.05,
"Minor Difference",
TRUE,
"Variance")))
```

Automatically classifies reconciliation status.

</details>

<details>
<summary><strong>Payment Review</strong></summary>

Primary Functions

- LET()
- FILTER()
- MAP()
- COUNTIF()
- HSTACK()

Purpose:

Automatically detect:

- Duplicate invoices
- Duplicate supplier payments
- Suspicious payment records
- Invoices requiring manual approval

Primary output:

```
Duplicate Invoice

↓

Finance Review

↓

Payment Approval

↓

Payment Released
```

</details>

<details>
<summary><strong>Cash Flow Forecast</strong></summary>

Weekly Timeline

```excel
=TODAY()+SEQUENCE(1,12,0,7)
```

Advertising Forecast

```excel
=MAP(
C1#,
LAMBDA(
week_start,
SUMIFS(
Advertising_Spend[Cost],
Advertising_Spend[Date],
">="&week_start,
Advertising_Spend[Date],
"<"&week_start+7)))
```

Purpose

- Rolling twelve-week forecast
- Automatically shifts every week
- No manual timeline maintenance

</details>

<details>
<summary><strong>Inventory Impact Simulator</strong></summary>

Core Logic

```excel
=LET(
min_cash,
...
projected_cash_at_prepay,
...
projected_cash_at_final,
...
IFS(...)
)
```

Business Logic

Evaluate:

- Deposit payment
- Final supplier payment
- Historical cash movement
- Safety reserve
- Liquidity after both payment events

Output

✅ Safe

⚠ Warning

❌ Cash Reserve Breach

</details>

---

## Validation Rules

<details>
<summary>Validation Rules Table</summary>

| Field | Validation Rule | Error Behavior |
|-------|-----------------|----------------|
| Order ID | Cannot be blank | Excluded from reconciliation |
| Invoice Number | Duplicate values trigger review | Payment warning generated |
| Payment Amount | Must be numeric | Record ignored until corrected |
| Purchase Order Value | Positive number only | Simulation disabled |
| Prepayment Percentage | Between 0% and 100% | Validation warning |
| Lead Time | Integer weeks only | Forecast unavailable |
| Transaction Date | Valid Excel Date | Forecast excluded |
| Advertising Cost | Numeric value | Weekly aggregation skipped |
| Safety Cash Reserve | Positive numeric parameter | Default value applied if missing |
| Reference ID | Consistent text format | Matching variance increases |

</details>

---

</details>

---

## Other Tools in This Series

This workbook is part of a growing collection of lightweight operational decision-support tools.

Examples include:

- Construction Project Cost Control Workbook
- Revenue Management Decision Engine
- Amazon Seller Reporting Automation
- CRM & Shopify Marketing Attribution
- Multifamily Acquisition Financial Model
- Construction Estimating & Cost Tracking
- Executive KPI Dashboards
- Cash Flow Forecasting Frameworks

Additional tools are available through the GitHub repository and Gumroad collection.

---

# License

Licensed under the **Apache License 2.0**.

This project may be used, modified, and distributed in accordance with the terms of the Apache License 2.0.

See the **LICENSE** file included with this repository for complete license information.
