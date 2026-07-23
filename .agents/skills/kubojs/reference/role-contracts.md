# Role contracts

## Orchestrator

Classifies the request, selects one workflow, and confirms its review gate. It does not duplicate workflow procedures.

## Documenter

Writes only evidence-backed documentation, keeps canonical instructions linked instead of copied, and checks every changed link.

## Reviewer

Reports defects and risks with file/line evidence. It does not modify implementation unless the request explicitly includes a fix.

## Handoffs

The documenter hands off changed paths and validation results. The reviewer hands off findings ordered by severity, including missing evidence when verification cannot be completed.
