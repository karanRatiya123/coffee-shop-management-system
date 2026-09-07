package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.OrderDAO;
import Backend.model.Order;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/OrderHistoryServlet")
public class OrderHistoryServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");

        OrderDAO dao = new OrderDAO();
        ArrayList<Order> history = dao.getCompletedOrders();

        PrintWriter out = response.getWriter();

        out.print("[");

        for (int i = 0; i < history.size(); i++) {

            Order order = history.get(i);

            out.print("{");

            out.print("\"id\":" + order.getOrderId() + ",");

            out.print("\"orderId\":" + order.getOrderId() + ",");

            out.print("\"customerId\":"
                    + (order.getCustomerId() > 0
                    ? order.getCustomerId()
                    : "null")
                    + ",");

            out.print("\"tableId\":"
                    + (order.getTableId() > 0
                    ? order.getTableId()
                    : "null")
                    + ",");

            out.print("\"createdAt\":\""
                    + (order.getOrderDate() != null
                    ? order.getOrderDate().toString()
                    : "")
                    + "\",");

            out.print("\"orderDate\":\""
                    + (order.getOrderDate() != null
                    ? order.getOrderDate().toString()
                    : "")
                    + "\",");

            out.print("\"subtotal\":" + order.getSubtotal() + ",");

            out.print("\"discount\":" + order.getDiscount() + ",");

            out.print("\"total\":"
                    + order.getTotalAmount() + ",");

            out.print("\"totalAmount\":"
                    + order.getTotalAmount() + ",");

            /*
             * Your orders table uses Completed.
             * Billing table contains the actual Paid status.
             * For the POS history display, Completed means the
             * order was successfully completed.
             */
            out.print("\"status\":\""
                    + (order.getStatus() != null
                    ? order.getStatus()
                    : "Completed")
                    + "\"");

            out.print("}");

            if (i < history.size() - 1) {
                out.print(",");
            }
        }

        out.print("]");
        out.flush();
    }
}
