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

        OrderDAO dao = new OrderDAO();

        ArrayList<Order> history = dao.getCompletedOrders();

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        out.print("[");

        for (int i = 0; i < history.size(); i++) {

            Order order = history.get(i);

            out.print("{");
            out.print("\"orderId\":" + order.getOrderId() + ",");
            out.print("\"customerId\":" + order.getCustomerId() + ",");
            out.print("\"tableId\":" + order.getTableId() + ",");
            out.print("\"orderDate\":\"" + (order.getOrderDate() != null ? order.getOrderDate().toString() : "") + "\",");
            out.print("\"subtotal\":" + order.getSubtotal() + ",");
            out.print("\"discount\":" + order.getDiscount() + ",");
            out.print("\"totalAmount\":" + order.getTotalAmount() + ",");
            out.print("\"status\":\"" + order.getStatus() + "\"");
            out.print("}");

            if (i < history.size() - 1) {
                out.print(",");
            }
        }

        out.print("]");
    }
}