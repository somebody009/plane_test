// components
import { ActivityGraph } from "components/workspace";
// ui
import { Loader, Tooltip } from "@plane/ui";
// icons
import { Info } from "lucide-react";
// types
import { IUserWorkspaceDashboard } from "types";
import { useRouter } from "next/router";
import Link from "next/link";

type Props = {
  data: IUserWorkspaceDashboard | undefined;
};

export const IssuesStats: React.FC<Props> = ({ data }) => {
  const router = useRouter();
  const { workspaceSlug } = router.query;
  return (
    <div className="grid grid-cols-1 rounded-[10px] border border-custom-border-200 bg-custom-background-100 lg:grid-cols-3">
      <div className="grid grid-cols-1 divide-y divide-custom-border-200 border-b border-custom-border-200 lg:border-b-0 lg:border-r">
        <div className="flex">
          <Link className="basis-1/2 p-4" href={`/${workspaceSlug}/workspace-views/assigned`}>
            <div>
              <h4 className="text-sm">Tasks assigned to you</h4>
              <h5 className="mt-2 text-2xl font-semibold">
                <div className="cursor-pointer">{data?.assigned_issues_count}</div>
              </h5>
            </div>
          </Link>
          <Link
            className="basis-1/2 border-l border-custom-border-200 p-4"
            href={`/${workspaceSlug}/workspace-views/all-issues`}
          >
            <div>
              <h4 className="text-sm">Pending Tasks</h4>
              <h5 className="mt-2 text-2xl font-semibold">{data?.pending_issues_count}</h5>
            </div>
          </Link>
        </div>
        <div className="flex">
          <Link className="basis-1/2 p-4" href={`/${workspaceSlug}/workspace-views/all-issues`}>
            <div>
              <h4 className="text-sm">Completed Tasks</h4>
              <h5 className="mt-2 text-2xl font-semibold">{data?.completed_issues_count}</h5>
            </div>
          </Link>
          <Link
            className="basis-1/2 border-l border-custom-border-200 p-4"
            href={`/${workspaceSlug}/workspace-views/all-issues`}
          >
            <div>
              <h4 className="text-sm">Tasks due by this week</h4>
              <h5 className="mt-2 text-2xl font-semibold">{data?.issues_due_week_count}</h5>
            </div>
          </Link>
        </div>
      </div>
      <div className="p-4 lg:col-span-2">
        <h3 className="mb-2 flex items-center gap-2 font-semibold capitalize">
          Activity Graph
          <Tooltip
            tooltipContent="Your profile activity graph is a record of actions you've performed on Tasks across the workspace."
            className="w-72 border border-custom-border-200"
          >
            <Info className="h-3 w-3" />
          </Tooltip>
        </h3>
        <ActivityGraph activities={data?.issue_activities} />
      </div>
    </div>
  );
};
