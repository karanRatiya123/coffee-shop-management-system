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

@WebServlet("/OrderServlet")
public class OrderServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        OrderDAO dao = new OrderDAO();
        ArrayList<Order> orderList = dao.getAllOrders();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print("[");

        for(int i=0;i<orderList.size();i++){
            Order order = orderList.get(i);
            out.print("{");
            out.print("\"orderId\":"+order.getOrderId()+",");
            out.print("\"customerId\":"+order.getCustomerId()+",");
            out.print("\"employeeId\":"+order.getEmployeeId()+",");
            out.print("\"orderDate\":\""+(order.getOrderDate() != null ? order.getOrderDate().toString() : "")+"\",");
            out.print("\"status\":\""+order.getStatus()+"\",");
            out.print("\"subtotal\":"+order.getSubtotal()+",");
            out.print("\"discount\":"+order.getDiscount()+",");
            out.print("\"totalAmount\":"+order.getTotalAmount());
            out.print("}");

            if(i<orderList.size()-1){
                out.print(",");
            }
        }

        out.print("]");
    }

    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        String status = request.getParameter("status");
        String subtotalStr = request.getParameter("subtotal");
        String discountStr = request.getParameter("discount");
        String totalAmountStr = request.getParameter("totalAmount");

        double subtotal = 0.0;
        double discount = 0.0;
        double totalAmount = 0.0;

        try {
            if (subtotalStr != null) {
				subtotal = Double.parseDouble(subtotalStr);
			}
            if (discountStr != null) {
				discount = Double.parseDouble(discountStr);
			}
            if (totalAmountStr != null) {
				totalAmount = Double.parseDouble(totalAmountStr);
			}
        } catch (NumberFormatException e) {
            e.printStackTrace();
        }

        Order order = new Order();
        order.setStatus(status != null ? status : "Paid");
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setTotalAmount(totalAmount);
        order.setCustomerId(1);
        order.setEmployeeId(1);
        order.setTableId(1);

        OrderDAO dao = new OrderDAO();
        int generatedId = dao.addOrder(order);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print("{\"success\":" + (generatedId > 0) + ",\"orderId\":" + generatedId + "}");
    }
}