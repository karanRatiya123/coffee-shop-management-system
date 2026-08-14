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

    public boolean addOrderDetail(OrderDetail detail) {
        boolean status = false;
        try {
            Connection con = DBConnection.getConnection();
            String sql = "INSERT INTO order_details(order_id, menu_id, quantity, unit_price, subtotal) VALUES(?, ?, ?, ?, ?)";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, detail.getOrderId());
            setSafeForeignKey(ps, 2, detail.getMenuId(), "menu_items", "menu_id", con);
            ps.setInt(3, detail.getQuantity());
            ps.setDouble(4, detail.getUnitPrice());
            ps.setDouble(5, detail.getSubtotal());

            int count = ps.executeUpdate();
            if (count > 0) {
                status = true;
            }
            ps.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return status;
    }
}