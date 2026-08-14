package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.OrderDAO;
import Backend.dao.OrderDetailDAO;
import Backend.model.Order;
import Backend.model.OrderDetail;
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
        OrderDetailDAO detailDAO = new OrderDetailDAO();

        ArrayList<Order> history = dao.getCompletedOrders();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        out.print("[");

        for (int i = 0; i < history.size(); i++) {

            Order order = history.get(i);
            ArrayList<OrderDetail> details = detailDAO.getOrderDetailsByOrderId(order.getOrderId());

            out.print("{");
            out.print("\"orderId\":" + order.getOrderId() + ",");
            out.print("\"customerId\":" + order.getCustomerId() + ",");
            out.print("\"tableId\":" + order.getTableId() + ",");
            out.print("\"orderDate\":\"" + (order.getOrderDate() != null ? order.getOrderDate().toString() : "") + "\",");
            out.print("\"subtotal\":" + order.getSubtotal() + ",");
            out.print("\"discount\":" + order.getDiscount() + ",");
            out.print("\"totalAmount\":" + order.getTotalAmount() + ",");
            out.print("\"status\":\"" + order.getStatus() + "\",");
            out.print("\"items\":[");
            for (int j = 0; j < details.size(); j++) {
                OrderDetail d = details.get(j);
                out.print("{");
                out.print("\"orderDetailId\":" + d.getOrderDetailId() + ",");
                out.print("\"orderId\":" + d.getOrderId() + ",");
                out.print("\"menuId\":" + d.getMenuId() + ",");
                out.print("\"quantity\":" + d.getQuantity() + ",");
                out.print("\"unitPrice\":" + d.getUnitPrice() + ",");
                out.print("\"subtotal\":" + d.getSubtotal());
                out.print("}");
                if (j < details.size() - 1) out.print(",");
            }
            out.print("]");
            out.print("}");

            if (i < history.size() - 1) {
                out.print(",");
            }
        }

        out.print("]");
    }
}