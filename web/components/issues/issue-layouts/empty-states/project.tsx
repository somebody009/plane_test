import { observer } from "mobx-react-lite";
import { PlusIcon } from "lucide-react";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { NewEmptyState } from "components/common/new-empty-state";
// constants
import { EUserWorkspaceRoles } from "constants/workspace";
// assets
import emptyIssue from "public/empty-state/empty_issues.webp";
import { EProjectStore } from "store/command-palette.store";

export const ProjectEmptyState: React.FC = observer(() => {
  const {
    commandPalette: commandPaletteStore,
    trackEvent: { setTrackElement },
    user: { currentProjectRole },
  } = useMobxStore();

  const isEditingAllowed = !!currentProjectRole && currentProjectRole >= EUserWorkspaceRoles.MEMBER;

  return (
    <div className="grid h-full w-full place-items-center">
      <NewEmptyState
        title="Create an Task and assign it to someone, even yourself"
        description="Think of Task as jobs, tasks, work, or JTBD. Which we like. An Task and its sub-Task are usually time-based actionables assigned to members of your team. Your team creates, assigns, and completes Task to move your project towards its goal."
        image={emptyIssue}
        comicBox={{
          title: "Task are building blocks in DSs.",
          direction: "left",
          description:
            "Redesign the Plane UI, Rebrand the company, or Launch the new fuel injection system are examples of Task that likely have sub-Task.",
        }}
        primaryButton={
          isEditingAllowed
            ? {
                text: "Create your first Task",
                icon: <PlusIcon className="h-3 w-3" strokeWidth={2} />,
                onClick: () => {
                  setTrackElement("PROJECT_EMPTY_STATE");
                  commandPaletteStore.toggleCreateIssueModal(true, EProjectStore.PROJECT);
                },
              }
            : null
        }
        disabled={!isEditingAllowed}
      />
    </div>
  );
});
