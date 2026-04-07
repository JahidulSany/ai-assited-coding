import './User.css';

function User({ name, avatarUrl }) {
  return (
    <div className="user-profile">
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className="user-profile__avatar"
      />
      <h2 className="user-profile__name" data-testid="user-card-name">
        {name}
      </h2>
    </div>
  );
}

export default User;
