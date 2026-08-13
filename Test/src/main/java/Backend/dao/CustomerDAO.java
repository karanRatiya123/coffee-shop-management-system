package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Customer;
import Backend.util.DBConnection;

public class CustomerDAO {

    public ArrayList<Customer> getAllCustomers() {

        ArrayList<Customer> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM customers";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Customer customer = new Customer();

                customer.setCustomerId(rs.getInt("customer_id"));
                customer.setName(rs.getString("name"));
                customer.setPhone(rs.getString("phone"));
                customer.setEmail(rs.getString("email"));
                customer.setLoyaltyPoints(rs.getInt("loyalty_points"));

                list.add(customer);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public Customer getCustomerById(int customerId) {

        Customer customer = null;

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM customers WHERE customer_id=?";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, customerId);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                customer = new Customer();

                customer.setCustomerId(rs.getInt("customer_id"));
                customer.setName(rs.getString("name"));
                customer.setPhone(rs.getString("phone"));
                customer.setEmail(rs.getString("email"));
                customer.setLoyaltyPoints(rs.getInt("loyalty_points"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return customer;
    }
}