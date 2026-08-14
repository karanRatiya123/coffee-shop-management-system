package Backend.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import Backend.dao.OrderDAO;
import Backend.dao.OrderDetailDAO;
import Backend.model.Order;
import Backend.model.OrderDetail;
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
        OrderDetailDAO detailDAO = new OrderDetailDAO();
        ArrayList<Order> orderList = dao.getAllOrders();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print("[");

        for(int i=0;i<orderList.size();i++){
            Order order = orderList.get(i);
            ArrayList<OrderDetail> details = detailDAO.getOrderDetailsByOrderId(order.getOrderId());

            out.print("{");
            out.print("\"orderId\":"+order.getOrderId()+",");
            out.print("\"customerId\":"+order.getCustomerId()+",");
            out.print("\"employeeId\":"+order.getEmployeeId()+",");
            out.print("\"orderDate\":\""+(order.getOrderDate() != null ? order.getOrderDate().toString() : "")+"\",");
            out.print("\"status\":\""+order.getStatus()+"\",");
            out.print("\"subtotal\":"+order.getSubtotal()+",");
            out.print("\"discount\":"+order.getDiscount()+",");
            out.print("\"totalAmount\":"+order.getTotalAmount()+",");
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

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        String body = sb.toString().trim();

        String status = null;
        String subtotalStr = null;
        String discountStr = null;
        String totalAmountStr = null;
        String customerIdStr = null;
        String employeeIdStr = null;
        String tableIdStr = null;

        ArrayList<OrderDetail> details = new ArrayList<>();

        if (body.startsWith("{") || body.startsWith("[")) {
            status = extractJsonValue(body, "status");
            subtotalStr = extractJsonValue(body, "subtotal");
            discountStr = extractJsonValue(body, "discount");
            totalAmountStr = extractJsonValue(body, "totalAmount");
            if (totalAmountStr == null) totalAmountStr = extractJsonValue(body, "total");
            customerIdStr = extractJsonValue(body, "customerId");
            employeeIdStr = extractJsonValue(body, "employeeId");
            tableIdStr = extractJsonValue(body, "tableId");

            details = parseItemsFromJson(body);
        } else {
            status = request.getParameter("status");
            subtotalStr = request.getParameter("subtotal");
            discountStr = request.getParameter("discount");
            totalAmountStr = request.getParameter("totalAmount");
            customerIdStr = request.getParameter("customerId");
            employeeIdStr = request.getParameter("employeeId");
            tableIdStr = request.getParameter("tableId");

            String itemsParam = request.getParameter("items");
            if (itemsParam != null && !itemsParam.isEmpty()) {
                details = parseItemsFromJson(itemsParam);
            }
        }

        double subtotal = 0.0;
        double discount = 0.0;
        double totalAmount = 0.0;
        int customerId = 1;
        int employeeId = 1;
        int tableId = 1;

        try {
            if (subtotalStr != null && !subtotalStr.isEmpty()) subtotal = Double.parseDouble(subtotalStr);
            if (discountStr != null && !discountStr.isEmpty()) discount = Double.parseDouble(discountStr);
            if (totalAmountStr != null && !totalAmountStr.isEmpty()) totalAmount = Double.parseDouble(totalAmountStr);
            if (customerIdStr != null && !customerIdStr.isEmpty()) customerId = Integer.parseInt(customerIdStr);
            if (employeeIdStr != null && !employeeIdStr.isEmpty()) employeeId = Integer.parseInt(employeeIdStr);
            if (tableIdStr != null && !tableIdStr.isEmpty()) tableId = Integer.parseInt(tableIdStr);
        } catch (NumberFormatException e) {
            e.printStackTrace();
        }

        Order order = new Order();
        order.setStatus(status != null ? status : "Completed");
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setTotalAmount(totalAmount);
        order.setCustomerId(customerId);
        order.setEmployeeId(employeeId);
        order.setTableId(tableId);

        OrderDAO dao = new OrderDAO();
        int generatedId = dao.addOrderWithDetails(order, details);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print("{\"success\":" + (generatedId > 0) + ",\"orderId\":" + generatedId + "}");
    }

    private String extractJsonValue(String json, String key) {
        if (json == null || key == null) return null;
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*(\"[^\"]*\"|[^,}\\]]+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String val = matcher.group(1).trim();
            if (val.startsWith("\"") && val.endsWith("\"")) {
                val = val.substring(1, val.length() - 1);
            }
            return val;
        }
        return null;
    }

    private ArrayList<OrderDetail> parseItemsFromJson(String json) {
        ArrayList<OrderDetail> list = new ArrayList<>();
        if (json == null || json.isEmpty()) return list;

        int itemsStart = json.indexOf("\"items\"");
        if (itemsStart == -1) itemsStart = json.indexOf("items");
        if (itemsStart != -1) {
            int arrayStart = json.indexOf("[", itemsStart);
            int arrayEnd = json.lastIndexOf("]");
            if (arrayStart != -1 && arrayEnd > arrayStart) {
                String arrayContent = json.substring(arrayStart + 1, arrayEnd);
                Pattern objPattern = Pattern.compile("\\{[^{}]*\\}");
                Matcher objMatcher = objPattern.matcher(arrayContent);
                while (objMatcher.find()) {
                    String objStr = objMatcher.group();
                    try {
                        OrderDetail detail = new OrderDetail();
                        String menuIdStr = extractJsonValue(objStr, "menuId");
                        if (menuIdStr == null) menuIdStr = extractJsonValue(objStr, "id");
                        String qtyStr = extractJsonValue(objStr, "quantity");
                        String priceStr = extractJsonValue(objStr, "unitPrice");
                        if (priceStr == null) priceStr = extractJsonValue(objStr, "price");
                        String subtotalStr = extractJsonValue(objStr, "subtotal");
                        if (subtotalStr == null) subtotalStr = extractJsonValue(objStr, "total");

                        if (menuIdStr != null) detail.setMenuId(Integer.parseInt(menuIdStr));
                        if (qtyStr != null) detail.setQuantity(Integer.parseInt(qtyStr));
                        if (priceStr != null) detail.setUnitPrice(Double.parseDouble(priceStr));
                        if (subtotalStr != null) detail.setSubtotal(Double.parseDouble(subtotalStr));

                        list.add(detail);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        return list;
    }
}