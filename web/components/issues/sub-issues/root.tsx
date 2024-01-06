import React, { useCallback } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import useSWR, { mutate } from "swr";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { ExistingIssuesListModal } from "components/core";
import { CreateUpdateIssueModal, DeleteIssueModal } from "components/issues";
import { SubIssuesRootList } from "./issues-list";
import { ProgressBar } from "./progressbar";
// ui
import { CustomMenu } from "@plane/ui";
// hooks
import useToast from "hooks/use-toast";
// helpers
import { copyTextToClipboard } from "helpers/string.helper";
// types
import { IUser, IIssue, ISearchIssueResponse } from "types";
// services
import { IssueService } from "services/issue";
// fetch keys
import { SUB_ISSUES } from "constants/fetch-keys";
import { EUserWorkspaceRoles } from "constants/workspace";

export interface ISubIssuesRoot {
  parentIssue: IIssue;
  user: IUser | undefined;
}

export interface ISubIssuesRootLoaders {
  visibility: string[];
  delete: string[];
  sub_issues: string[];
}
export interface ISubIssuesRootLoadersHandler {
  key: "visibility" | "delete" | "sub_issues";
  issueId: string;
}

const issueService = new IssueService();

export const SubIssuesRoot: React.FC<ISubIssuesRoot> = observer((props) => {
  const { parentIssue, user } = props;

  const {
    user: { currentProjectRole },
    issue: { updateIssueStructure },
    projectIssues: { updateIssue, removeIssue },
  } = useMobxStore();

  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { setToastAlert } = useToast();

  const { data: issues, isLoading } = useSWR(
    workspaceSlug && projectId && parentIssue && parentIssue?.id ? SUB_ISSUES(parentIssue?.id) : null,
    workspaceSlug && projectId && parentIssue && parentIssue?.id
      ? () => issueService.subIssues(workspaceSlug.toString(), projectId.toString(), parentIssue.id)
      : null
  );

  const [issuesLoader, setIssuesLoader] = React.useState<ISubIssuesRootLoaders>({
    visibility: [parentIssue?.id],
    delete: [],
    sub_issues: [],
  });
  const handleIssuesLoader = ({ key, issueId }: ISubIssuesRootLoadersHandler) => {
    setIssuesLoader((previousData: ISubIssuesRootLoaders) => ({
      ...previousData,
      [key]: previousData[key].includes(issueId)
        ? previousData[key].filter((i: string) => i !== issueId)
        : [...previousData[key], issueId],
    }));
  };

  const [issueCrudOperation, setIssueCrudOperation] = React.useState<{
    create: { toggle: boolean; issueId: string | null };
    existing: { toggle: boolean; issueId: string | null };
    edit: { toggle: boolean; issueId: string | null; issue: IIssue | null };
    delete: { toggle: boolean; issueId: string | null; issue: IIssue | null };
  }>({
    create: {
      toggle: false,
      issueId: null,
    },
    existing: {
      toggle: false,
      issueId: null,
    },
    edit: {
      toggle: false,
      issueId: null, // parent issue id for mutation
      issue: null,
    },
    delete: {
      toggle: false,
      issueId: null, // parent issue id for mutation
      issue: null,
    },
  });
  const handleIssueCrudOperation = (
    key: "create" | "existing" | "edit" | "delete",
    issueId: string | null,
    issue: IIssue | null = null
  ) => {
    setIssueCrudOperation({
      ...issueCrudOperation,
      [key]: {
        toggle: !issueCrudOperation[key].toggle,
        issueId: issueId,
        issue: issue,
      },
    });
  };

  const addAsSubIssueFromExistingIssues = async (data: ISearchIssueResponse[]) => {
    if (!workspaceSlug || !projectId || !parentIssue || issueCrudOperation?.existing?.issueId === null) return;
    const issueId = issueCrudOperation?.existing?.issueId;
    const payload = {
      sub_issue_ids: data.map((i) => i.id),
    };
    await issueService.addSubIssues(workspaceSlug.toString(), projectId.toString(), issueId, payload).finally(() => {
      if (issueId) mutate(SUB_ISSUES(issueId));
    });
  };

  const removeIssueFromSubIssues = async (parentIssueId: string, issue: IIssue) => {
    if (!workspaceSlug || !projectId || !parentIssue || !issue?.id) return;
    issueService
      .patchIssue(workspaceSlug.toString(), projectId.toString(), issue.id, { parent: null })
      .then(async () => {
        if (parentIssueId) await mutate(SUB_ISSUES(parentIssueId));
        handleIssuesLoader({ key: "delete", issueId: issue?.id });
        setToastAlert({
          type: "success",
          title: `Task removed!`,
          message: `Task removed successfully.`,
        });
      })
      .catch(() => {
        handleIssuesLoader({ key: "delete", issueId: issue?.id });
        setToastAlert({
          type: "warning",
          title: `Error!`,
          message: `Error, Please try again later.`,
        });
      });
  };

  const copyText = (text: string) => {
    const originURL = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
    copyTextToClipboard(`${originURL}/${text}`).then(() => {
      setToastAlert({
        type: "success",
        title: "Link Copied!",
        message: "Task link copied to clipboard.",
      });
    });
  };

  const handleUpdateIssue = useCallback(
    (issue: IIssue, data: Partial<IIssue>) => {
      if (!workspaceSlug || !projectId || !user) return;

      const payload = {
        ...issue,
        ...data,
      };

      updateIssueStructure(null, null, payload);
      updateIssue(workspaceSlug.toString(), projectId.toString(), issue.id, data);
    },
    [updateIssueStructure, projectId, updateIssue, user, workspaceSlug]
  );

  const handleDeleteIssue = useCallback(
    async (issue: IIssue) => {
      if (!workspaceSlug || !projectId || !user) return;

      await removeIssue(workspaceSlug.toString(), projectId.toString(), issue.id);
      await mutate(SUB_ISSUES(parentIssue?.id));
    },
    [removeIssue, projectId, user, workspaceSlug, parentIssue?.id]
  );

  const isEditable = !!currentProjectRole && currentProjectRole >= EUserWorkspaceRoles.MEMBER;

  const mutateSubIssues = (parentIssueId: string | null) => {
    if (parentIssueId) mutate(SUB_ISSUES(parentIssueId));
  };

  return (
    <div className="h-full w-full space-y-2">
      {!issues && isLoading ? (
        <div className="py-3 text-center text-sm  font-medium text-custom-text-300">Loading...</div>
      ) : (
        <>
          {issues && issues?.sub_issues && issues?.sub_issues?.length > 0 ? (
            <>
              {/* header */}
              <div className="relative flex items-center gap-4 text-xs">
                <div
                  className="flex cursor-pointer select-none items-center gap-1 rounded border border-custom-border-100 p-1.5 px-2 shadow transition-all hover:bg-custom-background-80"
                  onClick={() => handleIssuesLoader({ key: "visibility", issueId: parentIssue?.id })}
                >
                  <div className="flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center">
                    {issuesLoader.visibility.includes(parentIssue?.id) ? (
                      <ChevronDown width={16} strokeWidth={2} />
                    ) : (
                      <ChevronRight width={14} strokeWidth={2} />
                    )}
                  </div>
                  <div>Sub-issues</div>
                  <div>({issues?.sub_issues?.length || 0})</div>
                </div>

                <div className="w-full max-w-[250px] select-none">
                  <ProgressBar
                    total={issues?.sub_issues?.length || 0}
                    done={(issues?.state_distribution?.cancelled || 0) + (issues?.state_distribution?.completed || 0)}
                  />
                </div>

                {isEditable && issuesLoader.visibility.includes(parentIssue?.id) && (
                  <div className="ml-auto flex flex-shrink-0 select-none items-center gap-2">
                    <div
                      className="cursor-pointer rounded border border-custom-border-100 p-1.5 px-2 shadow transition-all hover:bg-custom-background-80"
                      onClick={() => handleIssueCrudOperation("create", parentIssue?.id)}
                    >
                      Add sub-Task
                    </div>
                    <div
                      className="cursor-pointer rounded border border-custom-border-100 p-1.5 px-2 shadow transition-all hover:bg-custom-background-80"
                      onClick={() => handleIssueCrudOperation("existing", parentIssue?.id)}
                    >
                      Add an existing Task
                    </div>
                  </div>
                )}
              </div>

              {/* issues */}
              {issuesLoader.visibility.includes(parentIssue?.id) && workspaceSlug && projectId && (
                <div className="border border-b-0 border-custom-border-100">
                  <SubIssuesRootList
                    handleDeleteIssue={handleDeleteIssue}
                    workspaceSlug={workspaceSlug.toString()}
                    projectId={projectId.toString()}
                    parentIssue={parentIssue}
                    user={undefined}
                    editable={isEditable}
                    removeIssueFromSubIssues={removeIssueFromSubIssues}
                    issuesLoader={issuesLoader}
                    handleIssuesLoader={handleIssuesLoader}
                    copyText={copyText}
                    handleIssueCrudOperation={handleIssueCrudOperation}
                    handleUpdateIssue={handleUpdateIssue}
                  />
                </div>
              )}

              <div>
                <CustomMenu
                  label={
                    <>
                      <Plus className="h-3 w-3" />
                      Add sub-Task
                    </>
                  }
                  buttonClassName="whitespace-nowrap"
                  placement="bottom-end"
                  noBorder
                  noChevron
                >
                  <CustomMenu.MenuItem
                    onClick={() => {
                      mutateSubIssues(parentIssue?.id);
                      handleIssueCrudOperation("create", parentIssue?.id);
                    }}
                  >
                    Create new
                  </CustomMenu.MenuItem>
                  <CustomMenu.MenuItem
                    onClick={() => {
                      mutateSubIssues(parentIssue?.id);
                      handleIssueCrudOperation("existing", parentIssue?.id);
                    }}
                  >
                    Add an existing Task
                  </CustomMenu.MenuItem>
                </CustomMenu>
              </div>
            </>
          ) : (
            isEditable && (
              <div className="flex items-center justify-between">
                <div className="py-2 text-xs italic text-custom-text-300">No Sub-Tasks yet</div>
                <div>
                  <CustomMenu
                    label={
                      <>
                        <Plus className="h-3 w-3" />
                        Add sub-Task
                      </>
                    }
                    buttonClassName="whitespace-nowrap"
                    placement="bottom-end"
                    noBorder
                    noChevron
                  >
                    <CustomMenu.MenuItem
                      onClick={() => {
                        mutateSubIssues(parentIssue?.id);
                        handleIssueCrudOperation("create", parentIssue?.id);
                      }}
                    >
                      Create new
                    </CustomMenu.MenuItem>
                    <CustomMenu.MenuItem
                      onClick={() => {
                        mutateSubIssues(parentIssue?.id);
                        handleIssueCrudOperation("existing", parentIssue?.id);
                      }}
                    >
                      Add an existing Task
                    </CustomMenu.MenuItem>
                  </CustomMenu>
                </div>
              </div>
            )
          )}
          {isEditable && issueCrudOperation?.create?.toggle && (
            <CreateUpdateIssueModal
              isOpen={issueCrudOperation?.create?.toggle}
              prePopulateData={{
                parent: issueCrudOperation?.create?.issueId,
              }}
              handleClose={() => {
                mutateSubIssues(issueCrudOperation?.create?.issueId);
                handleIssueCrudOperation("create", null);
              }}
            />
          )}
          {isEditable && issueCrudOperation?.existing?.toggle && issueCrudOperation?.existing?.issueId && (
            <ExistingIssuesListModal
              isOpen={issueCrudOperation?.existing?.toggle}
              handleClose={() => handleIssueCrudOperation("existing", null)}
              searchParams={{ sub_issue: true, issue_id: issueCrudOperation?.existing?.issueId }}
              handleOnSubmit={addAsSubIssueFromExistingIssues}
              workspaceLevelToggle
            />
          )}
          {isEditable && issueCrudOperation?.edit?.toggle && issueCrudOperation?.edit?.issueId && (
            <>
              <CreateUpdateIssueModal
                isOpen={issueCrudOperation?.edit?.toggle}
                handleClose={() => {
                  mutateSubIssues(issueCrudOperation?.edit?.issueId);
                  handleIssueCrudOperation("edit", null, null);
                }}
                data={issueCrudOperation?.edit?.issue}
              />
            </>
          )}
          {isEditable &&
            workspaceSlug &&
            projectId &&
            issueCrudOperation?.delete?.issueId &&
            issueCrudOperation?.delete?.issue && (
              <DeleteIssueModal
                isOpen={issueCrudOperation?.delete?.toggle}
                handleClose={() => {
                  mutateSubIssues(issueCrudOperation?.delete?.issueId);
                  handleIssueCrudOperation("delete", null, null);
                }}
                data={issueCrudOperation?.delete?.issue}
                onSubmit={async () => {
                  await removeIssue(
                    workspaceSlug.toString(),
                    projectId.toString(),
                    issueCrudOperation?.delete?.issue?.id ?? ""
                  );
                }}
              />
            )}
        </>
      )}
    </div>
  );
});
