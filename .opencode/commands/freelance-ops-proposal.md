# /freelance-opsproposal (STUB)

**Status:** STUB - command shell only. Mode content authored in Plan 2.

This command is wired up so that the CLI recognizes it. When run, it should
delegate to the corresponding mode file:

  Read and execute modes/proposal.md

For Plan 2+ (the content phase), each command will be fully implemented with:
- Description and arguments
- Invokes the right mode file
- Handles the auto-detect case (no args -> show menu, with URL -> scan, with text -> lead)