# Table of Contents

1. [PR Title Conventions](#pr-title-conventions)
2. [Require Follow-up PR](#require-followup-pr)

## PR Title Conventions

If PR is related to Jira, PR title convention should be

`{jira ticket} {#action} {descriptions}`

`JRA-090 JRA-091 #close #comment Fixed this today`

Read more https://www.conventionalcommits.org/en/v1.0.0-beta.2/

### Jira ticket

Every PR should have a Jira ticket, if there isn't request from business side to create one PR on behalf.

### Action

#close will automatically close the correspond jira ticket.

#comment will automatically add your description on the jira ticket.

The title will automatically be use as a commit message when we squash and merge the PR.

### Best practice

-   Best practice is to raise one PR for one Jira ticket. If in any event we need to revert single ticket it is easier.
-   Keep the file changes to a minimum. If there's a ticket which requires 100+ file changes, create new branch and raise small chunks (~20 file changes at a time). Once approved, repeat the cycle.

## Require followup PR

Very often we raise PR to merge the code in order to let testers to test it out / on tight deadline. Once testing is done and developer has time, please raise additional PR to refactor those codes.
