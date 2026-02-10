# Man Overboard: Stuck Agent Replacement

Use when an agent is unresponsive, looping, or producing no useful output.

1. Admiral identifies the stuck agent and its assigned task.
2. Admiral records the agent's last known progress and any partial outputs.
3. Admiral issues a shutdown request to the stuck agent.
4. Admiral spawns a replacement agent with the same role.
5. Admiral briefs the replacement with: task definition, dependencies, partial outputs, and known blockers.
6. Replacement agent resumes from the last verified checkpoint, not from scratch.
7. Admiral updates the battle plan to reflect the new assignment.
