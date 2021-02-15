import './layout.css';

// Todo : implement submit functionality

function Login() {
  return (
    <>
        <h2>Sign In</h2>
        <form>
            <label>
                Username:
                <input type="text" name="username" size="30" />
            </label>
            <label>
            Password:
                <input type="password" name="password" size="30" />
            </label>
            <div className="actions">
                <input type="submit" value="Sign In"/>
            </div>
        </form>
    </>
  );
}

export default Login;
