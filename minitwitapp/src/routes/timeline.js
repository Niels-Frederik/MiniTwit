import './layout.css';
import Message from '../components/message'

const mockJSON = {
    "messages":[
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/norton",
        "username":"norton",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/hampus",
        "username":"hampus",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/emil",
        "username":"emil",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/norton",
        "username":"norton",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/yarl",
        "username":"yarl",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/niller",
        "username":"niller",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    ]
}

function loadMessages(){
    var messageElements = []
    mockJSON.messages.forEach( message => {
        console.log(message);
        messageElements.push(
            <Message 
                img_src={message.img_src}
                user_href={message.user_href}
                username={message.username}
                text={message.text}
                timestamp={message.timestamp}
            />
        )
    })
    return messageElements;
}

function Timeline() {
  return (
    <ul className="messages">
        {loadMessages()}
    </ul>
  );
}

export default Timeline;
