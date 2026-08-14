package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Order;
import Backend.model.OrderDetail;
import Backend.util.DBConnection;

public class OrderDAO {

    private void setSafeForeignKey(PreparedStatement ps, int paramIndex, int id, String parentTable, String idColumn, Connection con) throws Exception {
        if (id > 0) {
            String checkSql = "SELECT 1 FROM " + parentTable + " WHERE " + idColumn + " = ?";
            try (PreparedStatement checkPs = con.prepareStatement(checkSql)) {
                checkPs.setInt(1, id);
                try (ResultSet rs = checkPs.executeQuery()) {
                    if (rs.next()) {
                        ps.setInt(paramIndex, id);
                        return;
                    }
                }
            }
        }
        ps.setNull(paramIndex, java.sql.Types.INTEGER);
    }

    // Show all orders
    public ArrayList<Order> getAllOrders() {

        ArrayList<Order> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM orders ORDER BY order_date DESC";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Order order = new Order();

                order.setOrderId(rs.getInt("order_id"));
                order.setCustomerId(rs.getInt("customer_id"));
                order.setEmployeeId(rs.getInt("employee_id"));
                order.setTableId(rs.getInt("table_id"));
                order.setOrderDate(rs.getTimestamp("order_date"));
                order.setStatus(rs.getString("status"));
                order.setSubtotal(rs.getDouble("subtotal"));
                order.setDiscount(rs.getDouble("discount"));
                order.setTotalAmount(rs.getDouble("total_amount"));

                list.add(order);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // Get one order
    public Order getOrderById(int orderId) {

        Order order = null;

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM orders WHERE order_id=?";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, orderId);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                order = new Order();

                order.setOrderId(rs.getInt("order_id"));
                order.setCustomerId(rs.getInt("customer_id"));
                order.setEmployeeId(rs.getInt("employee_id"));
                order.setTableId(rs.getInt("table_id"));
                order.setOrderDate(rs.getTimestamp("order_date"));
                order.setStatus(rs.getString("status"));
                order.setSubtotal(rs.getDouble("subtotal"));
                order.setDiscount(rs.getDouble("discount"));
                order.setTotalAmount(rs.getDouble("total_amount"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return order;
    }

//Get Completed & Paid Orders (Order History)
public ArrayList<Order> getCompletedOrders() {

 ArrayList<Order> list = new ArrayList<>();

 try {

     Connection con = DBConnection.getConnection();

     String sql = "SELECT * FROM orders WHERE status='Completed' OR status='Paid' ORDER BY order_date DESC";

     PreparedStatement ps = con.prepareStatement(sql);

     ResultSet rs = ps.executeQuery();

     while (rs.next()) {

         Order order = new Order();

         order.setOrderId(rs.getInt("order_id"));
         order.setCustomerId(rs.getInt("customer_id"));
         order.setEmployeeId(rs.getInt("employee_id"));
         order.setTableId(rs.getInt("table_id"));
         order.setOrderDate(rs.getTimestamp("order_date"));
         order.setStatus(rs.getString("status"));
         order.setSubtotal(rs.getDouble("subtotal"));
         order.setDiscount(rs.getDouble("discount"));
         order.setTotalAmount(rs.getDouble("total_amount"));

         list.add(order);
     }

     con.close();

 } catch (Exception e) {
     e.printStackTrace();
 }

 return list;
}

    // Get Today Sales sum
    public double getTodaySales() {
        double total = 0.0;
        try {
            Connection con = DBConnection.getConnection();
            if (con != null) {
                String sql = "SELECT SUM(total_amount) AS today_sales FROM orders WHERE (status='Completed' OR status='Paid') AND DATE(order_date) = CURDATE()";
                PreparedStatement ps = con.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    total = rs.getDouble("today_sales");
                }
                rs.close();
                ps.close();
                con.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return total;
    }

    // Get Today Orders count
    public int getTodayOrdersCount() {
        int count = 0;
        try {
            Connection con = DBConnection.getConnection();
            if (con != null) {
                String sql = "SELECT COUNT(*) AS today_count FROM orders WHERE DATE(order_date) = CURDATE()";
                PreparedStatement ps = con.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    count = rs.getInt("today_count");
                }
                rs.close();
                ps.close();
                con.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }

    // Get Today Items Sold count
    public int getTodayItemsSoldCount() {
        int count = 0;
        try {
            Connection con = DBConnection.getConnection();
            if (con != null) {
                String sql = "SELECT SUM(od.quantity) AS items_sold FROM order_details od JOIN orders o ON od.order_id = o.order_id WHERE (o.status='Completed' OR o.status='Paid') AND DATE(o.order_date) = CURDATE()";
                PreparedStatement ps = con.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    count = rs.getInt("items_sold");
                }
                rs.close();
                ps.close();
                con.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }

    public int addOrder(Order order) {
        return addOrderWithDetails(order, null);
    }

    public int addOrderWithDetails(Order order, ArrayList<OrderDetail> details) {
        int generatedId = -1;
        Connection con = null;
        try {
            con = DBConnection.getConnection();
            if (con != null) {
                con.setAutoCommit(false);

                String sql = "INSERT INTO orders(customer_id, employee_id, table_id, order_date, status, subtotal, discount, total_amount) VALUES(?, ?, ?, NOW(), ?, ?, ?, ?)";
                PreparedStatement ps = con.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);

                setSafeForeignKey(ps, 1, order.getCustomerId(), "customers", "customer_id", con);
                setSafeForeignKey(ps, 2, order.getEmployeeId(), "staff", "staff_id", con);
                setSafeForeignKey(ps, 3, order.getTableId(), "cafe_tables", "table_id", con);

                String status = order.getStatus();
                if (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("Paid")) {
                    status = "Completed";
                }
                ps.setString(4, status);
                ps.setDouble(5, order.getSubtotal());
                ps.setDouble(6, order.getDiscount());
                ps.setDouble(7, order.getTotalAmount());

                int affected = ps.executeUpdate();
                if (affected > 0) {
                    ResultSet rs = ps.getGeneratedKeys();
                    if (rs.next()) {
                        generatedId = rs.getInt(1);
                    }
                    rs.close();
                }
                ps.close();

                if (generatedId > 0 && details != null && !details.isEmpty()) {
                    String detailSql = "INSERT INTO order_details(order_id, menu_id, quantity, unit_price, subtotal) VALUES(?, ?, ?, ?, ?)";
                    PreparedStatement detailPs = con.prepareStatement(detailSql);
                    for (OrderDetail detail : details) {
                        detailPs.setInt(1, generatedId);
                        setSafeForeignKey(detailPs, 2, detail.getMenuId(), "menu_items", "menu_id", con);
                        detailPs.setInt(3, detail.getQuantity());
                        detailPs.setDouble(4, detail.getUnitPrice());
                        detailPs.setDouble(5, detail.getSubtotal());
                        detailPs.addBatch();
                    }
                    detailPs.executeBatch();
                    detailPs.close();
                }

                con.commit();
            }
        } catch (Exception e) {
            if (con != null) {
                try { con.rollback(); } catch (Exception ex) {}
            }
            e.printStackTrace();
        } finally {
            if (con != null) {
                try { con.close(); } catch (Exception e) {}
            }
        }
        return generatedId;
    }
}