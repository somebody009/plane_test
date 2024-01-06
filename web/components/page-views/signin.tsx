import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// hooks
import useSignInRedirection from "hooks/use-sign-in-redirection";
// components
import { SignInRoot } from "components/account";
// ui
import { Loader, Spinner } from "@plane/ui";
// images
import BluePlaneLogoWithoutText from "public/plane-logos/blue-without-text.png";

export type AuthType = "sign-in" | "sign-up";

export const SignInView = observer(() => {
  // store
  const {
    user: { currentUser },
    appConfig: { envConfig },
  } = useMobxStore();
  // sign in redirection hook
  const { isRedirecting, handleRedirection } = useSignInRedirection();

  useEffect(() => {
    handleRedirection();
  }, [handleRedirection]);

  if (isRedirecting || currentUser)
    return (
      <div className="grid h-screen place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="h-full w-full bg-onboarding-gradient-100">
      <div className="flex items-center justify-between px-8 pb-4 sm:px-16 sm:py-5 lg:px-28 ">
        <div className="flex items-center gap-x-2 py-10">
          <Image src={BluePlaneLogoWithoutText} height={30} width={30} alt="Plane Logo" className="mr-2" />
          <span className="text-2xl font-semibold sm:text-3xl">DSS</span>
        </div>
      </div>

      <div className="mx-auto h-full rounded-t-md border-x border-t border-custom-border-200 bg-onboarding-gradient-100 px-4 pt-4 shadow-sm sm:w-4/5 md:w-2/3 ">
        <div className="h-full overflow-auto rounded-t-md bg-onboarding-gradient-200 px-7 pb-56 pt-24 sm:px-0">
          {!envConfig ? (
            <div className="mx-auto flex justify-center pt-10">
              <div>
                <Loader className="mx-auto w-full space-y-4 pb-4">
                  <Loader.Item height="46px" width="360px" />
                  <Loader.Item height="46px" width="360px" />
                </Loader>

                <Loader className="mx-auto w-full space-y-4 pt-4">
                  <Loader.Item height="46px" width="360px" />
                  <Loader.Item height="46px" width="360px" />
                </Loader>
              </div>
            </div>
          ) : (
            <SignInRoot />
          )}
        </div>
      </div>
    </div>
  );
});
