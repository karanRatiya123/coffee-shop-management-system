package Backend.servlet;

import java.io.IOException;

import Backend.dao.UserDAO;
import Backend.model.user;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        // Receive data sent from JavaScript
        String username = request.getParameter("username");
        String pin = request.getParameter("pin");

        System.out.println("Username : " + username);
        System.out.println("PIN      : " + pin);

        UserDAO dao = new UserDAO();

        user u = dao.login(username, pin);

        if (u != null) {

            HttpSession session = request.getSession();

            session.setAttribute("user", u);
            session.setAttribute("username", u.getUsername());
            session.setAttribute("role", u.getRole());

            response.setStatus(HttpServletResponse.SC_OK);

        } else {

            response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid PIN");

        }
    }
}