package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.UserDAO;
import Backend.model.user;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/OperatorServlet")
public class OperatorServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        UserDAO dao = new UserDAO();

        ArrayList<user> operators = dao.getAllOperators();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        out.print("[");

        for (int i = 0; i < operators.size(); i++) {

            user user = operators.get(i);

            String avatar = (user.getAvatar() != null) ? user.getAvatar() : "";

            out.print("{");
            out.print("\"userId\":" + user.getUserId() + ",");
            out.print("\"username\":\"" + escapeJson(user.getUsername()) + "\",");
            out.print("\"email\":\"" + escapeJson(user.getEmail()) + "\",");
            out.print("\"role\":\"" + escapeJson(user.getRole()) + "\",");
            out.print("\"avatar\":\"" + escapeJson(avatar) + "\"");
            out.print("}");

            if (i < operators.size() - 1) {
                out.print(",");
            }
        }

        out.print("]");
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}