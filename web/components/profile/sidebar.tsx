import { useRouter } from "next/router";
import Link from "next/link";

import useSWR from "swr";

// headless ui
import { Disclosure, Transition } from "@headlessui/react";
// services
import { UserService } from "services/user.service";
// hooks
import useUser from "hooks/use-user";
// ui
import { Loader, Tooltip } from "@plane/ui";
// icons
import { ChevronDown, Pencil } from "lucide-react";
// helpers
import { renderLongDetailDateFormat } from "helpers/date-time.helper";
import { renderEmoji } from "helpers/emoji.helper";
// fetch-keys
import { USER_PROFILE_PROJECT_SEGREGATION } from "constants/fetch-keys";

// services
const userService = new UserService();

export const ProfileSidebar = () => {
  const router = useRouter();
  const { workspaceSlug, userId } = router.query;

  const { user } = useUser();

  const { data: userProjectsData } = useSWR(
    workspaceSlug && userId ? USER_PROFILE_PROJECT_SEGREGATION(workspaceSlug.toString(), userId.toString()) : null,
    workspaceSlug && userId
      ? () => userService.getUserProfileProjectsSegregation(workspaceSlug.toString(), userId.toString())
      : null
  );

  // Create a date object for the current time in the specified timezone
  const currentTime = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: userProjectsData?.user_data.user_timezone,
    hour12: false, // Use 24-hour format
    hour: "2-digit",
    minute: "2-digit",
  });
  const timeString = formatter.format(currentTime);

  const userDetails = [
    {
      label: "Joined on",
      value: renderLongDetailDateFormat(userProjectsData?.user_data.date_joined ?? ""),
    },
    {
      label: "Timezone",
      value: (
        <span>
          {timeString} <span className="text-custom-text-200">{userProjectsData?.user_data.user_timezone}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="w-full flex-shrink-0 overflow-y-auto shadow-custom-shadow-sm md:h-full md:w-80">
      {userProjectsData ? (
        <>
          <div className="relative h-32">
            {user?.id === userId && (
              <div className="absolute right-3.5 top-3.5 grid h-5 w-5 place-items-center rounded bg-white">
                <Link href="/profile">
                  <span className="grid place-items-center text-black">
                    <Pencil className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            )}
            <img
              src={
                userProjectsData.user_data.cover_image ?? "https://images.unsplash.com/photo-1506383796573-caf02b4a79ab"
              }
              alt={userProjectsData.user_data.display_name}
              className="h-32 w-full object-cover"
            />
            <div className="absolute -bottom-[26px] left-5 h-[52px] w-[52px] rounded">
              {userProjectsData.user_data.avatar && userProjectsData.user_data.avatar !== "" ? (
                <img
                  src={userProjectsData.user_data.avatar}
                  alt={userProjectsData.user_data.display_name}
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded bg-custom-background-90 text-custom-text-100 capitalize">
                  {userProjectsData.user_data.first_name?.[0]}
                </div>
              )}
            </div>
          </div>
          <div className="px-5">
            <div className="mt-[38px]">
              <h4 className="text-lg font-semibold">
                {userProjectsData.user_data.first_name} {userProjectsData.user_data.last_name}
              </h4>
              <h6 className="text-sm text-custom-text-200">({userProjectsData.user_data.display_name})</h6>
            </div>
            <div className="mt-6 space-y-5">
              {userDetails.map((detail) => (
                <div key={detail.label} className="flex items-center gap-4 text-sm">
                  <div className="w-2/5 flex-shrink-0 text-custom-text-200">{detail.label}</div>
                  <div className="w-3/5 break-words font-medium">{detail.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-9 divide-y divide-custom-border-100">
              {userProjectsData.project_data.map((project, index) => {
                const totalIssues =
                  project.created_issues + project.assigned_issues + project.pending_issues + project.completed_issues;

                const completedIssuePercentage =
                  project.assigned_issues === 0
                    ? 0
                    : Math.round((project.completed_issues / project.assigned_issues) * 100);

                return (
                  <Disclosure key={project.id} as="div" className={`${index === 0 ? "pb-3" : "py-3"}`}>
                    {({ open }) => (
                      <div className="w-full">
                        <Disclosure.Button className="flex w-full items-center justify-between gap-2">
                          <div className="flex w-3/4 items-center gap-2">
                            {project.emoji ? (
                              <div className="grid h-7 w-7 flex-shrink-0 place-items-center">
                                {renderEmoji(project.emoji)}
                              </div>
                            ) : project.icon_prop ? (
                              <div className="grid h-7 w-7 flex-shrink-0 place-items-center">
                                {renderEmoji(project.icon_prop)}
                              </div>
                            ) : (
                              <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded bg-custom-background-90 text-xs uppercase text-custom-text-100">
                                {project?.name.charAt(0)}
                              </div>
                            )}
                            <div className="truncate break-words text-sm font-medium">{project.name}</div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            {project.assigned_issues > 0 && (
                              <Tooltip tooltipContent="Completion percentage" position="left">
                                <div
                                  className={`rounded px-1 py-0.5 text-xs font-medium ${
                                    completedIssuePercentage <= 35
                                      ? "bg-red-500/10 text-red-500"
                                      : completedIssuePercentage <= 70
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : "bg-green-500/10 text-green-500"
                                  }`}
                                >
                                  {completedIssuePercentage}%
                                </div>
                              </Tooltip>
                            )}
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </Disclosure.Button>
                        <Transition
                          show={open}
                          enter="transition duration-100 ease-out"
                          enterFrom="transform opacity-0"
                          enterTo="transform opacity-100"
                          leave="transition duration-75 ease-out"
                          leaveFrom="transform opacity-100"
                          leaveTo="transform opacity-0"
                        >
                          <Disclosure.Panel className="mt-5 pl-9">
                            {totalIssues > 0 && (
                              <div className="flex items-center gap-0.5">
                                <div
                                  className="h-1 rounded"
                                  style={{
                                    backgroundColor: "#203b80",
                                    width: `${(project.created_issues / totalIssues) * 100}%`,
                                  }}
                                />
                                <div
                                  className="h-1 rounded"
                                  style={{
                                    backgroundColor: "#3f76ff",
                                    width: `${(project.assigned_issues / totalIssues) * 100}%`,
                                  }}
                                />
                                <div
                                  className="h-1 rounded"
                                  style={{
                                    backgroundColor: "#f59e0b",
                                    width: `${(project.pending_issues / totalIssues) * 100}%`,
                                  }}
                                />
                                <div
                                  className="h-1 rounded"
                                  style={{
                                    backgroundColor: "#16a34a",
                                    width: `${(project.completed_issues / totalIssues) * 100}%`,
                                  }}
                                />
                              </div>
                            )}
                            <div className="mt-7 space-y-5 text-sm text-custom-text-200">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#203b80]" />
                                  Created
                                </div>
                                <div className="font-medium">{project.created_issues} Tasks</div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#3f76ff]" />
                                  Assigned
                                </div>
                                <div className="font-medium">{project.assigned_issues} Tasks</div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
                                  Due
                                </div>
                                <div className="font-medium">{project.pending_issues} Tasks</div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-sm bg-[#16a34a]" />
                                  Completed
                                </div>
                                <div className="font-medium">{project.completed_issues} Tasks</div>
                              </div>
                            </div>
                          </Disclosure.Panel>
                        </Transition>
                      </div>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <Loader className="space-y-7 px-5">
          <Loader.Item height="130px" />
          <div className="space-y-5">
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
            <Loader.Item height="20px" />
          </div>
        </Loader>
      )}
    </div>
  );
};
