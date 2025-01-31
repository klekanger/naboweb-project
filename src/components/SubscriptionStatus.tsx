"use client";

import { updateSubscriptionStatus } from "@/app/actions/updateSubscriptionStatus";
import { Checkbox, Spinner } from "@heroui/react";
import { useState } from "react";

type SubscriptionStatusProps = {
  userId: string;
  initialSubscriptionStatus: boolean;
};

export default function SubscriptionStatus({
  userId,
  initialSubscriptionStatus,
}: SubscriptionStatusProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscriptionStatus);
  const [isPending, setIsPending] = useState(false);

  const handleSubscriptionChange = async (isSelected: boolean) => {
    // Store the previous state in case we need to revert
    const previousState = isSubscribed;

    // Optimistically update the UI
    setIsSubscribed(isSelected);
    setIsPending(true);

    try {
      const result = await updateSubscriptionStatus(userId, isSelected);

      if ("error" in result) {
        // If there's an error, revert to the previous state
        setIsSubscribed(previousState);
        console.error("Something went wrong:", result.error);
      } else if ("success" in result) {
        // Update with the actual server state
        setIsSubscribed(result.success?.emailSubscription ?? false);
      }
    } catch (error) {
      // If there's an exception, revert to the previous state
      setIsSubscribed(previousState);
      console.error("Failed to update subscription:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Checkbox
        isSelected={isSubscribed}
        onValueChange={handleSubscriptionChange}
        isDisabled={isPending}
      >
        Aktiver e-postvarsling {isPending ? <Spinner size="sm" /> : ""}
      </Checkbox>

      <div>
        <p className="text-sm text-gray-500">
          Du vil {isSubscribed ? "motta" : "ikke motta"} e-postvarsler fra oss
          når det er ny informasjon fra styret eller nye innlegg på
          oppslagstavlen.
        </p>
      </div>
    </>
  );
}
