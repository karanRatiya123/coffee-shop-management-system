package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.OrderDetail;
import Backend.util.DBConnection;

public class OrderDetailDAO {

    // Display all items of a specific order
    public ArrayList<OrderDetail> getOrderDetailsByOrderId(int orderId) {

        ArrayList<OrderDetail> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM order_details WHERE order_id=?";

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, orderId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                OrderDetail detail = new OrderDetail();

                detail.setOrderDetailId(rs.getInt("order_detail_id"));
                detail.setOrderId(rs.getInt("order_id"));
                detail.setMenuId(rs.getInt("menu_id"));
                detail.setQuantity(rs.getInt("quantity"));
                detail.setUnitPrice(rs.getDouble("unit_price"));
                detail.setSubtotal(rs.getDouble("subtotal"));

                list.add(detail);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // Calculate total quantity of items in an order
    public int getTotalItems(int orderId) {

        int total = 0;

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT SUM(quantity) AS total FROM order_details WHERE order_id=?";

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, orderId);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                total = rs.getInt("total");
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return total;
    }

    public boolean addOrderDetail(OrderDetail detail, Connection con) throws java.sql.SQLException {
        String sql = "INSERT INTO order_details(order_id, menu_id, quantity, unit_price, subtotal) VALUES(?, ?, ?, ?, ?)";
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setInt(1, detail.getOrderId());
        ps.setInt(2, detail.getMenuId());
        ps.setInt(3, detail.getQuantity());
        ps.setDouble(4, detail.getUnitPrice());
        ps.setDouble(5, detail.getSubtotal());

        int count = ps.executeUpdate();
        ps.close();
        return count > 0;
    }

    public boolean addOrderDetail(OrderDetail detail) {
        boolean status = false;
        try {
            Connection con = DBConnection.getConnection();
            if (con != null) {
                status = addOrderDetail(detail, con);
                con.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return status;
    }
}