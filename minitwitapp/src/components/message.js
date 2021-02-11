import '../routes/layout.css';

function Message({ img_src, user_href, username, text, timestamp }) {
  return (
    <li key={username}>
        <img src={img_src}></img>
        <p>
            <strong>
                <a href={user_href}>{username}</a>
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
