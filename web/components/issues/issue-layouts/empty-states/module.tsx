import { PlusIcon } from "lucide-react";
// components
import { EmptyState } from "components/common";
import { Button } from "@plane/ui";
// assets
import emptyIssue from "public/empty-state/issue.svg";
import { ExistingIssuesListModal } from "components/core";
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
import { ISearchIssueResponse } from "types";
import useToast from "hooks/use-toast";
import { useState } from "react";
// constants
import { EUserWorkspaceRoles } from "constants/workspace";

type Props = {
  workspaceSlug: string | undefined;
  projectId: string | undefined;
  moduleId: string | undefined;
};

export const ModuleEmptyState: React.FC<Props> = observer((props) => {
  const { workspaceSlug, projectId, moduleId } = props;
  // states
  const [moduleIssuesListModal, setModuleIssuesListModal] = useState(false);

  const {
    moduleIssues: moduleIssueStore,
    commandPalette: commandPaletteStore,
    trackEvent: { setTrackElement },
    user: { currentProjectRole: userRole },
  } = useMobxStore();

  const { setToastAlert } = useToast();

  const handleAddIssuesToModule = async (data: ISearchIssueResponse[]) => {
    if (!workspaceSlug || !projectId || !moduleId) return;

    const issueIds = data.map((i) => i.id);

    await moduleIssueStore.addIssueToModule(workspaceSlug.toString(), moduleId.toString(), issueIds).catch(() =>
      setToastAlert({
        type: "error",
        title: "Error!",
        message: "Selected issues could not be added to the module. Please try again.",
      })
    );
  };

  const isEditingAllowed = !!userRole && userRole >= EUserWorkspaceRoles.MEMBER;

  return (
    <>
      <ExistingIssuesListModal
        isOpen={moduleIssuesListModal}
        handleClose={() => setModuleIssuesListModal(false)}
        searchParams={{ module: true }}
        handleOnSubmit={handleAddIssuesToModule}
      />
      <div className="grid h-full w-full place-items-center">
        <EmptyState
          title="Module Task will appear here"
          description="Task help you track individual pieces of work. With Task, keep track of what's going on, who is working on it, and what's done."
          image={emptyIssue}
          primaryButton={{
            text: "New Task",
            icon: <PlusIcon className="h-3 w-3" strokeWidth={2} />,
            onClick: () => {
              setTrackElement("MODULE_EMPTY_STATE");
              commandPaletteStore.toggleCreateIssueModal(true);
            },
          }}
          secondaryButton={
            <Button
              variant="neutral-primary"
              prependIcon={<PlusIcon className="h-3 w-3" strokeWidth={2} />}
              onClick={() => setModuleIssuesListModal(true)}
              disabled={!isEditingAllowed}
            >
              Add an existing Task
            </Button>
          }
          disabled={!isEditingAllowed}
        />
      </div>
    </>
  );
});
