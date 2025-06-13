// lib/config/site.ts

export const siteConfig = {
  name: "Mjeti360",
  logoUrl:
    "https://bfjdbugavmagzhpgobfi.supabase.co/storage/v1/object/public/pictures/mjeti360/mjeti360_logo.png",

  auth: {
    login: {
      title: "Sign in to your account",
      altTitle: "Create your account",
      switchToSignup: "Create an account",
      switchToSignin: "Sign in to existing account",
      forgotPassword: "Forgot password?",
      promptAlt: "New to our platform?",
      promptBack: "Already have an account?",
      submitSignin: "Sign in",
      submitSignup: "Sign up",
      loading: "Loading...",
    },
    forgotPassword: {
      title: "Forgot your password?",
      description: "Enter your email and we’ll send you a reset link.",
      submit: "Send Reset Link",
      pending: "Sending...",
      goBack: "Go back to sign in",
    },
    resetPassword: {
      title: "Reset your password",
      description: "Enter a new password to complete your reset.",
      passwordLabel: "New Password",
      confirmLabel: "Confirm Password",
      submit: "Reset Password",
      pending: "Resetting...",
      goBack: "Go back to sign in",
    },
    agreement: {
      text: "By continuing, you agree to our",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
    },
  },

  navigation: {
    items: {
      dashboard: "Dashboard",
      team: "Team",
      general: "General",
      activity: "Activity",
      security: "Security",
      pricing: "Pricing",
      signUp: "Sign Up",
      signOut: "Sign out",
    },
    titles: {
      settings: "Settings",
    },
  },

  teamSettings: {
    pageTitle: "Team Settings",
    subscription: {
      title: "Team Subscription",
      currentPlan: "Current Plan",
      statuses: {
        active: "Billed monthly",
        trialing: "Trial period",
        none: "No active subscription",
      },
      manageButton: "Manage Subscription",
    },
    name: {
      title: "Team Name",
      placeholder: "Enter team name",
      update: "Update Name",
      saving: "Saving...",
    },
    members: {
      title: "Team Members",
      empty: "No team members yet.",
      remove: "Remove",
      removing: "Removing...",
    },
    invite: {
      title: "Invite Team Member",
      emailPlaceholder: "Enter email",
      roleLabel: "Role",
      button: "Invite Member",
      inviting: "Inviting...",
      onlyOwnerNotice: "You must be a team owner to invite new members.",
      roles: {
        member: "Member",
        owner: "Owner",
      },
    },
  },

  security: {
    title: "Security Settings",
    password: {
      title: "Password",
      current: "Current Password",
      new: "New Password",
      confirm: "Confirm New Password",
      updateButton: "Update Password",
      updating: "Updating...",
    },
    delete: {
      title: "Delete Account",
      description:
        "Account deletion is non-reversable. Please proceed with caution.",
      confirmPassword: "Confirm Password",
      deleteButton: "Delete Account",
      deleting: "Deleting...",
    },
  },

  general: {
    title: "General Settings",
    account: {
      title: "Account Information",
      nameLabel: "Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      submitButton: "Save Changes",
      submitting: "Saving...",
    },
  },


  activity: {
    title: "Activity Log",
    recent: "Recent Activity",
    emptyTitle: "No activity yet",
    emptyDescription:
      "When you perform actions like signing in or updating your account, they'll appear here.",
    actions: {
      SIGN_UP: "signed up",
      SIGN_IN: "signed in",
      SIGN_OUT: "signed out",
      UPDATE_PASSWORD: "changed your password",
      DELETE_ACCOUNT: "deleted your account",
      UPDATE_ACCOUNT: "updated your account",
      CREATE_TEAM: "created a new team",
      UPDATE_TEAM: "updated your team",
      REMOVE_TEAM_MEMBER: "removed a team member",
      INVITE_TEAM_MEMBER: "invited a team member",
      ACCEPT_INVITATION: "accepted an invitation",
      UNKNOWN: "Unknown action occurred",
    },

    
  },
  
  
};

export type SiteConfig = typeof siteConfig;
