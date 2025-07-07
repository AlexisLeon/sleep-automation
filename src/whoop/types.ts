/** ISO-8601 date **/
export type WhoopDateTime = string;

export interface OAuth2RequestTokenResponse {
  access_token: string;
  access_token_expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
}

export interface RetrieveSleepNeededResponse {
  turn_off_schedule_modal: {
    modal_title_display: string;
    modal_subtext_display: string;
    button_action_display_text: string;
    dismiss_action_display_text: string;
  };
  turn_off_all_modal: {
    modal_title_display: string;
    modal_subtext_display: string;
    button_action_display_text: string;
    dismiss_action_display_text: string;
  };
  chip_label_text_display: string;
  alarm_schedule_state: string;
  next_schedule_day_label: string | null;
  eligible_for_smart_alarms: boolean;
  need_breakdown: {
    total: number;
    baseline: number;
    naps: number;
    strain: number;
    debt: number;
  };
  need_breakdown_formatted: {
    total_need: string;
    baseline_need: string;
    naps_need: string;
    strain_need: string;
    debt_need: string;
  };
  recommended_time_in_bed_formatted: {
    [key: string]: {
      recommended_time_in_bed: number;
      optimal_endpoints_formatted: {
        start: string;
        end: string;
      };
      max_possible_sri: number | null;
      projected_sleep_consistency: number | null;
      sleep_adjustment_time_string: string | null;
      estimated_awake_time_string: string;
      recommended_time_in_bed_time_string: string;
      sleep_need_time_string: string;
      flex_sleep_time: boolean;
    };
  };
  menstrual_coach_enabled: boolean;
  sleep_coach_onboarding_state: string | null;
  menstrual_coaching_details: unknown | null;
}

export interface RetrieveSmartAlarmPreferencesResponse {
  lower_time_bound: string;
  recovery_score_goal: number | null;
  sleep_score_goal: number | null;
  weekly_plan_goal: string | null;
  weekly_plan_sleep_hours_goal_in_minutes: number | null;
  weekly_plan_sleep_hours_goal: number | null;
  weekly_plan_goal_info: string | null;
  /** string array "['2025-07-07T06:00:00.000-06','2025-07-07T07:00:00.000-06']", **/
  alarm_bounds: string;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
  upper_time_bound: string;
  time_zone_offset: string;
  goal: "EXACT_TIME_PERFORM" | "SLEEP_HEALTH_PEAK";
  enabled: boolean;
  schedule_enabled: boolean;
  window_minutes: number;
  day_of_week: string | null;
  default: boolean;
}
