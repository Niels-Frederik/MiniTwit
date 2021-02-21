import '../routes/layout.css';
import {Link, Route} from 'react-router-dom'
//import Timeline from '../routes/timeline'

function Message({ username, text, pub_date }) {

  //function getMessage()
  //{
    //const username = m.username
    //const text = m.text
    //const pub_date = m.pub_date
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
  //}
/*
  return (
    <div className="page">
      <div classname="message">{getMessage()}</div>
      <div classname="body"> 
        <Route 
        path="/username" 
        render={(props) => (
          <Timeline {...props} publicTimeline={true} userMessage={true}/>
        )}
        />
        </div>
    </div>
  )
  */
}


export default Message;

                  //<Link to= {`/${username}`}>{username} </Link>
                //<a href= {`/${username}`}>{username}</a>