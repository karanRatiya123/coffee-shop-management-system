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

            out.print("{");
            out.print("\"userId\":" + user.getUserId() + ",");
            out.print("\"username\":\"" + escapeJson(user.getUsername()) + "\",");
            out.print("\"email\":\"" + escapeJson(user.getEmail()) + "\",");
            out.print("\"role\":\"" + escapeJson(user.getRole()) + "\",");
            out.print("\"avatar\":\"" + escapeJson(normalizeAvatar(user.getAvatar())) + "\"");
            out.print("}");

            if (i < operators.size() - 1) {
                out.print(",");
            }
        }

        out.print("]");
    }

    private String normalizeAvatar(String avatar) {
        if (avatar == null || avatar.trim().isEmpty()) {
            return "images/default-avatar.svg";
        }
        String path = avatar.trim().replace('\\', '/');
        // Broken legacy default that was stored in DB but never existed as a file
        if (path.equals("default-avatar.png") || path.equals("images/default-avatar.png")) {
            return "images/default-avatar.svg";
        }
        // Bare filename (e.g. karan.jpg) → images/karan.jpg
        if (!path.contains("/") && !path.startsWith("http")) {
            return "images/" + path;
        }
        return path;
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}