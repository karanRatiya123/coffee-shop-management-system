package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Billing;
import Backend.util.DBConnection;

public class BillingDAO {

    // Display all bills
    public ArrayList<Billing> getAllBills() {

        ArrayList<Billing> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM billing ORDER BY bill_date DESC";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Billing bill = new Billing();

                bill.setBillId(rs.getInt("bill_id"));
                bill.setOrderId(rs.getInt("order_id"));
                bill.setBillDate(rs.getTimestamp("bill_date"));
                bill.setSubtotal(rs.getDouble("subtotal"));
                bill.setDiscount(rs.getDouble("discount"));
                bill.setTax(rs.getDouble("tax"));
                bill.setGrandTotal(rs.getDouble("grand_total"));
                bill.setPaymentMethod(rs.getString("payment_method"));
                bill.setPaymentStatus(rs.getString("payment_status"));

                list.add(bill);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // Get one bill
    public Billing getBillById(int billId) {

        Billing bill = null;

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM billing WHERE bill_id=?";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, billId);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                bill = new Billing();

                bill.setBillId(rs.getInt("bill_id"));
                bill.setOrderId(rs.getInt("order_id"));
                bill.setBillDate(rs.getTimestamp("bill_date"));
                bill.setSubtotal(rs.getDouble("subtotal"));
                bill.setDiscount(rs.getDouble("discount"));
                bill.setTax(rs.getDouble("tax"));
                bill.setGrandTotal(rs.getDouble("grand_total"));
                bill.setPaymentMethod(rs.getString("payment_method"));
                bill.setPaymentStatus(rs.getString("payment_status"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return bill;
    }

    // Get bill using Order ID
    public Billing getBillByOrderId(int orderId) {

        Billing bill = null;

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM billing WHERE order_id=?";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, orderId);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                bill = new Billing();

                bill.setBillId(rs.getInt("bill_id"));
                bill.setOrderId(rs.getInt("order_id"));
                bill.setBillDate(rs.getTimestamp("bill_date"));
                bill.setSubtotal(rs.getDouble("subtotal"));
                bill.setDiscount(rs.getDouble("discount"));
                bill.setTax(rs.getDouble("tax"));
                bill.setGrandTotal(rs.getDouble("grand_total"));
                bill.setPaymentMethod(rs.getString("payment_method"));
                bill.setPaymentStatus(rs.getString("payment_status"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return bill;
    }

    public boolean addBilling(Billing billing, Connection con) throws java.sql.SQLException {
        String sql = "INSERT INTO billing(order_id, bill_date, subtotal, discount, tax, grand_total, payment_method, payment_status) VALUES(?, NOW(), ?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setInt(1, billing.getOrderId());
        ps.setDouble(2, billing.getSubtotal());
        ps.setDouble(3, billing.getDiscount());
        ps.setDouble(4, billing.getTax());
        ps.setDouble(5, billing.getGrandTotal());
        ps.setString(6, billing.getPaymentMethod() != null ? billing.getPaymentMethod() : "Cash");
        ps.setString(7, billing.getPaymentStatus() != null ? billing.getPaymentStatus() : "Paid");

        int count = ps.executeUpdate();
        ps.close();
        return count > 0;
    }

    public boolean addBilling(Billing billing) {
        boolean status = false;
        try {
            Connection con = DBConnection.getConnection();
            if (con != null) {
                status = addBilling(billing, con);
                con.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return status;
    }
}