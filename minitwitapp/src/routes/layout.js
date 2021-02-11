import './layout.css';
import { Link, Route } from 'react-router-dom'
import login from './login'
import register from './register'
import timeline from './timeline'

const loggedIn = false;
const username = "norton"

function isLoggedIn(){
    if(loggedIn){
        return(
            <>
                <Link to="/timeline">my timeline</Link>
                <Link to="/public_timeline">public timeline</Link>
                <Link to="/logout">sign out {username}</Link>
            </>
        )
    }
    else{
        return(
            <>
                <Link to="/public_timeline">public timeline</Link>
                <Link to="/register">sign up</Link>
                <Link to="/login">sign in</Link>
            </>
        )
    }
}

function Layout() {
  return (
    <div className="page">
        <h1>MiniTwit</h1>
        <div className="navigation">
            {isLoggedIn()}
        </div>
        <div className="body">
            <Route path="/public_timeline" component={timeline}/>
            <Route path="/login" component={login}/>
            <Route path="/register" component={register}/>
        </div>
        <div className="footer">
            MiniTwit &mdash; A Flask Application
        </div>
    </div>
  );
}

export default Layout;
