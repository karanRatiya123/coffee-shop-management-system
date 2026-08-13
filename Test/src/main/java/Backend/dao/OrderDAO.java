package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Order;
import Backend.util.DBConnection;

public class OrderDAO {

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
        int generatedId = -1;
        try {
            Connection con = DBConnection.getConnection();
            if (con != null) {
                String sql = "INSERT INTO orders(customer_id, employee_id, table_id, order_date, status, subtotal, discount, total_amount) VALUES(?, ?, ?, NOW(), ?, ?, ?, ?)";
                PreparedStatement ps = con.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, order.getCustomerId() > 0 ? order.getCustomerId() : 1);
                ps.setInt(2, order.getEmployeeId() > 0 ? order.getEmployeeId() : 1);
                ps.setInt(3, order.getTableId() > 0 ? order.getTableId() : 1);
                ps.setString(4, order.getStatus() != null ? order.getStatus() : "Completed");
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
                con.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return generatedId;
    }
}