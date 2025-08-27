import { useAuth } from '../hooks/useAuth';

/**
 * UserCard component for displaying user profile and subscription status.
 *
 * Provides a compact user interface element that displays:
 * - User avatar and display name
 * - Current subscription plan status (Basic/Pro)
 * - Interactive button to open the user panel
 *
 * Features:
 * - Responsive design with flexbox layout
 * - Real-time subscription status display
 * - Consistent styling with the application theme
 * - Accessibility support with proper alt text
 *
 * @param {Object} props - Component props
 * @param {boolean} props.userPanel - Current state of user panel visibility
 * @param {Function} props.setUserPanel - Function to toggle user panel visibility
 * @returns {JSX.Element|null} User card button or null if no user
 */
const UserCard = ({ userPanel, setUserPanel }) => {
  const { user, subscribed } = useAuth();

  return (
    user && (
      <button
        className="clickable border-default hover:bg-accent bg-secondary flex h-12 min-w-56 gap-4 rounded-md border"
        onClick={() => setUserPanel(!userPanel)}
        aria-label={`Open user panel for ${user.displayName}`}
        aria-expanded={userPanel}
      >
        {/* User profile section */}
        <div className="flex flex-1 items-center justify-start gap-3 pl-3">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="border-secondary h-8 w-8 rounded-full border"
          />
          <span className="text-primary text-sm font-medium">{user.displayName}</span>
        </div>

        {/* Subscription status indicator */}
        <div className="flex min-w-16 flex-col justify-center pr-3 text-right">
          <span className={`text-xs font-semibold ${subscribed ? 'text-accent' : 'text-muted'}`}>
            {subscribed ? 'Pro' : 'Basic'}
          </span>
          <span className="text-muted text-xs">Plan</span>
        </div>
      </button>
    )
  );
};

export default UserCard;
