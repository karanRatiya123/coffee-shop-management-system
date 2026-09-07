package Backend.servlet;

import java.io.BufferedReader;
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

    // =========================================================
    // GET - SHOW ALL ORDERS
    // =========================================================
    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        OrderDAO dao = new OrderDAO();
        ArrayList<Order> orderList = dao.getAllOrders();

        PrintWriter out = response.getWriter();

        out.print("[");

        for (int i = 0; i < orderList.size(); i++) {

            Order order = orderList.get(i);

            out.print("{");

            out.print("\"orderId\":" + order.getOrderId() + ",");

            out.print("\"customerId\":" + order.getCustomerId() + ",");

            out.print("\"employeeId\":" + order.getEmployeeId() + ",");

            out.print("\"tableId\":" + order.getTableId() + ",");

            out.print("\"orderDate\":\""
                    + (order.getOrderDate() != null
                    ? order.getOrderDate().toString()
                    : "")
                    + "\",");

            out.print("\"status\":\""
                    + order.getStatus()
                    + "\",");

            out.print("\"subtotal\":"
                    + order.getSubtotal()
                    + ",");

            out.print("\"discount\":"
                    + order.getDiscount()
                    + ",");

            out.print("\"totalAmount\":"
                    + order.getTotalAmount());

            out.print("}");

            if (i < orderList.size() - 1) {
                out.print(",");
            }
        }

        out.print("]");
    }


    // =========================================================
    // POST - CREATE ORDER
    // =========================================================
    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println(
                "========== ORDER SERVLET POST CALLED =========="
        );

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        // =====================================================
        // READ JSON BODY
        // =====================================================

        StringBuilder sb = new StringBuilder();

        try (BufferedReader reader = request.getReader()) {

            String line;

            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        String body = sb.toString().trim();

        System.out.println("ORDER JSON:");
        System.out.println(body);


        // =====================================================
        // ORDER STATUS
        // =====================================================

        String rawStatus = getJsonString(
                body,
                "status",
                request.getParameter("status"),
                "Completed"
        );

        String status = normalizeOrderStatus(rawStatus);

        System.out.println(
                "Order status: raw="
                        + rawStatus
                        + " normalized="
                        + status
        );


        // =====================================================
        // ORDER AMOUNTS
        // =====================================================

        double subtotal = getJsonDouble(
                body,
                "subtotal",
                request.getParameter("subtotal"),
                0.0
        );

        double discount = getJsonDouble(
                body,
                "discount",
                request.getParameter("discount"),
                0.0
        );

        double tax = getJsonDouble(
                body,
                "tax",
                request.getParameter("tax"),
                0.0
        );

        double totalAmount = getJsonDouble(
                body,
                "totalAmount",
                request.getParameter("totalAmount"),
                0.0
        );

        // Support "total" also
        if (totalAmount == 0.0) {

            totalAmount = getJsonDouble(
                    body,
                    "total",
                    request.getParameter("total"),
                    0.0
            );
        }


        // =====================================================
        // PAYMENT INFORMATION
        // =====================================================

        String paymentMethod = getJsonString(
                body,
                "paymentMethod",
                request.getParameter("paymentMethod"),
                "Cash"
        );

        String paymentStatus = getJsonString(
                body,
                "paymentStatus",
                request.getParameter("paymentStatus"),
                "Paid"
        );


        // =====================================================
        // CUSTOMER / EMPLOYEE / TABLE
        // =====================================================
        //
        // These are OPTIONAL.
        //
        // Employee POS order:
        // customer_id = NULL
        // employee_id = NULL
        // table_id    = NULL
        //
        // If a value is actually supplied, it will be used.
        // =====================================================

        int customerId = getJsonInt(
                body,
                "customerId",
                request.getParameter("customerId"),
                0
        );

        int employeeId = getJsonInt(
                body,
                "employeeId",
                request.getParameter("employeeId"),
                0
        );

        int tableId = getJsonInt(
                body,
                "tableId",
                request.getParameter("tableId"),
                0
        );


        System.out.println(
                "Customer ID = " + customerId
        );

        System.out.println(
                "Employee ID = " + employeeId
        );

        System.out.println(
                "Table ID = " + tableId
        );


        // =====================================================
        // PARSE ORDER ITEMS
        // =====================================================

        ArrayList<Backend.model.OrderDetail> itemsList =
                parseItems(body);

        System.out.println(
                "Order items found = "
                        + itemsList.size()
        );


        // =====================================================
        // CREATE ORDER OBJECT
        // =====================================================

        Order order = new Order();

        order.setStatus(status);

        order.setSubtotal(subtotal);

        order.setDiscount(discount);

        order.setTotalAmount(totalAmount);

        // 0 means NULL in DAO
        order.setCustomerId(customerId);

        // 0 means NULL in DAO
        order.setEmployeeId(employeeId);

        // 0 means NULL in DAO
        order.setTableId(tableId);


        // =====================================================
        // DATABASE TRANSACTION
        // =====================================================

        java.sql.Connection con = null;

        int generatedOrderId = -1;

        boolean transactionSuccess = false;


        try {

            // -------------------------------------------------
            // OPEN CONNECTION
            // -------------------------------------------------

            con = Backend.util.DBConnection.getConnection();

            if (con == null) {

                throw new java.sql.SQLException(
                        "Failed to open DB Connection"
                );
            }

            con.setAutoCommit(false);


            // =================================================
            // 1. INSERT ORDER
            // =================================================

            OrderDAO orderDAO = new OrderDAO();

            generatedOrderId =
                    orderDAO.addOrder(order, con);

            if (generatedOrderId <= 0) {

                throw new java.sql.SQLException(
                        "ORDER INSERT FAILED"
                );
            }

            System.out.println(
                    "ORDER INSERT SUCCESS. ID = "
                            + generatedOrderId
            );


            // =================================================
            // 2. INSERT ORDER DETAILS
            // =================================================

            Backend.dao.OrderDetailDAO orderDetailDAO =
                    new Backend.dao.OrderDetailDAO();

            for (Backend.model.OrderDetail item : itemsList) {

                item.setOrderId(generatedOrderId);

                boolean itemOk =
                        orderDetailDAO.addOrderDetail(
                                item,
                                con
                        );

                if (!itemOk) {

                    throw new java.sql.SQLException(
                            "ORDER DETAIL INSERT FAILED. menuId = "
                                    + item.getMenuId()
                    );
                }

                System.out.println(
                        "ORDER DETAIL SUCCESS. menuId = "
                                + item.getMenuId()
                );
            }


            System.out.println(
                    "ORDER + DETAILS SUCCESS. NOW BILLING..."
            );


            // =================================================
            // 3. CREATE BILLING
            // =================================================

            Backend.model.Billing billing =
                    new Backend.model.Billing();

            billing.setOrderId(generatedOrderId);

            billing.setSubtotal(subtotal);

            billing.setDiscount(discount);

            billing.setTax(tax);

            billing.setGrandTotal(totalAmount);

            billing.setPaymentMethod(paymentMethod);

            billing.setPaymentStatus(paymentStatus);


            Backend.dao.BillingDAO billingDAO =
                    new Backend.dao.BillingDAO();

            boolean billingOk =
                    billingDAO.addBilling(
                            billing,
                            con
                    );

            if (!billingOk) {

                throw new java.sql.SQLException(
                        "BILLING INSERT FAILED"
                );
            }

            System.out.println(
                    "BILLING INSERT SUCCESS"
            );


            // =================================================
            // COMMIT
            // =================================================

            con.commit();

            transactionSuccess = true;

            System.out.println(
                    "========== ORDER TRANSACTION SUCCESS =========="
            );


        } catch (Exception e) {

            // =================================================
            // ROLLBACK
            // =================================================

            if (con != null) {

                try {
                    con.rollback();

                    System.out.println(
                            "TRANSACTION ROLLED BACK"
                    );

                } catch (java.sql.SQLException rollbackEx) {

                    rollbackEx.printStackTrace();
                }
            }


            e.printStackTrace();

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            String errorMessage = e.getMessage();

            if (errorMessage == null) {
                errorMessage = "Unknown server error";
            }

            errorMessage =
                    errorMessage
                            .replace("\\", "\\\\")
                            .replace("\"", "\\\"")
                            .replace("\n", " ")
                            .replace("\r", " ");


            out.print(
                    "{\"success\":false,"
                            + "\"error\":\""
                            + errorMessage
                            + "\"}"
            );

            return;


        } finally {

            // =================================================
            // CLOSE CONNECTION
            // =================================================

            if (con != null) {

                try {

                    con.setAutoCommit(true);

                    con.close();

                } catch (java.sql.SQLException closeEx) {

                    closeEx.printStackTrace();
                }
            }
        }


        // =====================================================
        // SUCCESS RESPONSE
        // =====================================================

        if (transactionSuccess) {

            out.print(
                    "{\"success\":true,"
                            + "\"orderId\":"
                            + generatedOrderId
                            + "}"
            );
        }
    }


    // =========================================================
    // NORMALIZE ORDER STATUS
    // =========================================================
    //
    // Database ENUM:
    //
    // Pending
    // Preparing
    // Completed
    // Cancelled
    //
    // "Paid" is NOT an order status.
    // Paid belongs to billing.payment_status.
    // =========================================================

    private String normalizeOrderStatus(String status) {

        if (status == null || status.trim().isEmpty()) {
            return "Completed";
        }

        status = status.trim();

        // If JavaScript sends Paid,
        // convert it to valid orders ENUM.
        if ("Paid".equalsIgnoreCase(status)) {
            return "Completed";
        }

        if ("Pending".equalsIgnoreCase(status)) {
            return "Pending";
        }

        if ("Preparing".equalsIgnoreCase(status)) {
            return "Preparing";
        }

        if ("Completed".equalsIgnoreCase(status)) {
            return "Completed";
        }

        if ("Cancelled".equalsIgnoreCase(status)) {
            return "Cancelled";
        }

        // Default
        return "Completed";
    }


    // =========================================================
    // GET JSON STRING
    // =========================================================

    private String getJsonString(
            String json,
            String key,
            String paramFallback,
            String defaultValue) {

        if (json != null && !json.isEmpty()) {

            java.util.regex.Pattern p =
                    java.util.regex.Pattern.compile(
                            "\""
                                    + key
                                    + "\"\\s*:\\s*\"([^\"]*)\""
                    );

            java.util.regex.Matcher m =
                    p.matcher(json);

            if (m.find()) {
                return m.group(1);
            }
        }

        if (paramFallback != null
                && !paramFallback.isEmpty()) {

            return paramFallback;
        }

        return defaultValue;
    }


    // =========================================================
    // GET JSON DOUBLE
    // =========================================================

    private double getJsonDouble(
            String json,
            String key,
            String paramFallback,
            double defaultValue) {

        if (json != null && !json.isEmpty()) {

            java.util.regex.Pattern p =
                    java.util.regex.Pattern.compile(
                            "\""
                                    + key
                                    + "\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)"
                    );

            java.util.regex.Matcher m =
                    p.matcher(json);

            if (m.find()) {

                try {

                    return Double.parseDouble(
                            m.group(1)
                    );

                } catch (Exception ignored) {
                }
            }
        }

        if (paramFallback != null
                && !paramFallback.isEmpty()) {

            try {

                return Double.parseDouble(
                        paramFallback
                );

            } catch (Exception ignored) {
            }
        }

        return defaultValue;
    }


    // =========================================================
    // GET JSON INT
    // =========================================================

    private int getJsonInt(
            String json,
            String key,
            String paramFallback,
            int defaultValue) {

        if (json != null && !json.isEmpty()) {

            java.util.regex.Pattern p =
                    java.util.regex.Pattern.compile(
                            "\""
                                    + key
                                    + "\"\\s*:\\s*(\\d+)"
                    );

            java.util.regex.Matcher m =
                    p.matcher(json);

            if (m.find()) {

                try {

                    return Integer.parseInt(
                            m.group(1)
                    );

                } catch (Exception ignored) {
                }
            }
        }

        if (paramFallback != null
                && !paramFallback.isEmpty()) {

            try {

                return Integer.parseInt(
                        paramFallback
                );

            } catch (Exception ignored) {
            }
        }

        return defaultValue;
    }


    // =========================================================
    // PARSE ORDER ITEMS
    // =========================================================

    private ArrayList<Backend.model.OrderDetail> parseItems(
            String body) {

        ArrayList<Backend.model.OrderDetail> itemsList =
                new ArrayList<>();

        if (body == null || body.isEmpty()) {
            return itemsList;
        }


        java.util.regex.Pattern itemsArrayPattern =
                java.util.regex.Pattern.compile(
                        "\"(?:items|cartItems)\"\\s*:\\s*\\[([^\\]]*)\\]"
                );

        java.util.regex.Matcher itemsArrayMatcher =
                itemsArrayPattern.matcher(body);

        if (!itemsArrayMatcher.find()) {
            return itemsList;
        }


        String arrayContent =
                itemsArrayMatcher.group(1);


        java.util.regex.Pattern itemObjPattern =
                java.util.regex.Pattern.compile(
                        "\\{([^}]*)\\}"
                );

        java.util.regex.Matcher itemObjMatcher =
                itemObjPattern.matcher(arrayContent);


        while (itemObjMatcher.find()) {

            String itemStr =
                    itemObjMatcher.group(1);


            int menuId =
                    getJsonInt(
                            "{" + itemStr + "}",
                            "menuId",
                            getJsonString(
                                    "{" + itemStr + "}",
                                    "id",
                                    null,
                                    "0"
                            ),
                            0
                    );


            int qty =
                    getJsonInt(
                            "{" + itemStr + "}",
                            "quantity",
                            getJsonString(
                                    "{" + itemStr + "}",
                                    "qty",
                                    null,
                                    "1"
                            ),
                            1
                    );


            double price =
                    getJsonDouble(
                            "{" + itemStr + "}",
                            "price",
                            getJsonString(
                                    "{" + itemStr + "}",
                                    "unitPrice",
                                    null,
                                    "0.0"
                            ),
                            0.0
                    );


            double itemSubtotal =
                    getJsonDouble(
                            "{" + itemStr + "}",
                            "subtotal",
                            getJsonString(
                                    "{" + itemStr + "}",
                                    "total",
                                    null,
                                    "0.0"
                            ),
                            price * qty
                    );


            if (menuId > 0) {

                Backend.model.OrderDetail detail =
                        new Backend.model.OrderDetail();

                detail.setMenuId(menuId);

                detail.setQuantity(qty);

                detail.setUnitPrice(price);

                detail.setSubtotal(itemSubtotal);

                itemsList.add(detail);
            }
        }


        return itemsList;
    }
}
