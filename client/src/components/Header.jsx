import { Link } from "react-router-dom"

const Header = () => {
  return (
    <div className="text-1xl text-red-400 font-bold">
      <Link to={"/"}>Go back</Link>
      <h1>Have an account?</h1>
      <Link to={"/login"}>
        <p>Login</p>
      </Link>
      <Link to={"/register"}>Register</Link>
    </div>
  )
}

export default Header
