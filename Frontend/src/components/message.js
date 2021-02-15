import '../routes/layout.css';

function Message({ username, text, timestamp }) {
  return (
    <li key={username}>
        <img src={ "http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48" }></img>
        <p>
            <strong>
                <a href= {`/${username}`}>{username}</a>
            </strong>
            {text}
            <small>
                {timestamp}
            </small>
        </p>
    </li>
  );
}

export default Message;
