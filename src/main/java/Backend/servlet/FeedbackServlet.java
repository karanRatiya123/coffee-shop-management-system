package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.FeedbackDAO;
import Backend.model.Feedback;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/FeedbackServlet")
public class FeedbackServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        FeedbackDAO dao = new FeedbackDAO();
        ArrayList<Feedback> feedbackList = dao.getAllFeedback();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print("[");
        for (int i = 0; i < feedbackList.size(); i++) {
            Feedback f = feedbackList.get(i);
            out.print("{");
            out.print("\"feedbackId\":" + f.getFeedbackId() + ",");
            out.print("\"customerId\":" + f.getCustomerId() + ",");
            out.print("\"orderId\":" + f.getOrderId() + ",");
            out.print("\"rating\":" + f.getRating() + ",");
            out.print("\"comments\":\"" + escapeJson(f.getComments()) + "\",");
            out.print("\"feedbackDate\":\"" + (f.getFeedbackDate() != null ? f.getFeedbackDate().toString() : "") + "\"");
            out.print("}");
            if (i < feedbackList.size() - 1) {
                out.print(",");
            }
        }
        out.print("]");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String ratingParam = request.getParameter("rating");
        String comments = request.getParameter("comment");
        if (comments == null || comments.trim().isEmpty()) {
            comments = request.getParameter("comments");
        }
        String name = request.getParameter("name");
        String category = request.getParameter("category");

        int rating = 5;
        if (ratingParam != null && !ratingParam.trim().isEmpty()) {
            try {
                rating = Integer.parseInt(ratingParam.trim());
            } catch (NumberFormatException e) {
                rating = 5;
            }
        }

        String fullComments = "";
        if (category != null && !category.trim().isEmpty()) {
            fullComments += "[" + category.trim() + "] ";
        }
        if (name != null && !name.trim().isEmpty()) {
            fullComments += "From: " + name.trim() + " - ";
        }
        fullComments += (comments != null ? comments.trim() : "");

        Feedback f = new Feedback();
        f.setRating(rating);
        f.setComments(fullComments);

        FeedbackDAO dao = new FeedbackDAO();
        boolean success = dao.addFeedback(f);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print("{\"success\":" + success + "}");
    }

    private String escapeJson(String value) {
        if (value == null) {
			return "";
		}
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
