import React from 'react';
import '../routes/layout.css';
import PropTypes from 'prop-types';

function Message({ username, text, pub_date }) {
    return (
      <li key={username}>
          <img src={ "http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48" }></img>
          <p>
              <strong>
                <a href= {`/${username}`}>{username}</a>
              </strong>
              {" "+ text}
          </p>
          <p>
              <small>
                  {(new Date(pub_date * 1000).toString().substring(0,25))}
              </small>
          </p>
      </li>
    );

}

Message.propTypes = {
  username: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  pub_date: PropTypes.number.isRequired,
};

export default Message;