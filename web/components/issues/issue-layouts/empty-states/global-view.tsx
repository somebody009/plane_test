// next
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { EmptyState } from "components/common";
// assets
import emptyIssue from "public/empty-state/issue.svg";
import emptyProject from "public/empty-state/project.svg";
// icons
import { Plus, PlusIcon } from "lucide-react";

export const GlobalViewEmptyState: React.FC = observer(() => {
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const {
    commandPalette: commandPaletteStore,
    project: projectStore,
    trackEvent: { setTrackElement },
  } = useMobxStore();

  const projects = workspaceSlug ? projectStore.projects[workspaceSlug.toString()] : null;

  return (
    <div className="grid h-full w-full place-items-center">
      {!projects || projects?.length === 0 ? (
        <EmptyState
          image={emptyProject}
          title="No projects yet"
          description="Get started by creating your first project"
          primaryButton={{
            icon: <Plus className="h-4 w-4" />,
            text: "New Project",
            onClick: () => {
              setTrackElement("ALL_ISSUES_EMPTY_STATE");
              commandPaletteStore.toggleCreateProjectModal(true);
            },
          }}
        />
      ) : (
        <EmptyState
          title="View Task will appear here"
          description="Task help you track individual pieces of work. With Task, keep track of what's going on, who is working on it, and what's done."
          image={emptyIssue}
          primaryButton={{
            text: "New Task",
            icon: <PlusIcon className="h-3 w-3" strokeWidth={2} />,
            onClick: () => {
              setTrackElement("ALL_ISSUES_EMPTY_STATE");
              commandPaletteStore.toggleCreateIssueModal(true);
            },
          }}
        />
      )}
    </div>
  );
});
