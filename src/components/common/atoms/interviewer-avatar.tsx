"use client";

import Avatar, { genConfig } from "react-nice-avatar";
import type { InterviewerProfile } from "@/lib/config/interviewers";

interface InterviewerAvatarProps {
  interviewer: InterviewerProfile;
  size?: number;
}

/**
 * Deterministic avatar component for interviewers
 * Uses interviewer ID as seed to ensure consistency
 */
export function InterviewerAvatar({
  interviewer,
  size = 40,
}: InterviewerAvatarProps) {
  // Generate a deterministic config using the interviewer's ID as seed
  // This ensures the same interviewer always gets the same avatar
  const config = genConfig(interviewer.id);

  // Override with our custom config
  const finalConfig = {
    ...config,
    ...interviewer.avatarConfig,
  };

  return (
    <div key={interviewer.id} className={`avatar-${interviewer.id}`}>
      <Avatar
        style={{ width: `${size}px`, height: `${size}px` }}
        {...finalConfig}
      />
    </div>
  );
}
