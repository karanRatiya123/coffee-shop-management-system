package Backend.test;

import java.sql.Connection;
import java.sql.SQLException;

import Backend.util.DBConnection;

public class test{
    public static void main(String[] args) {
        try (Connection con = DBConnection.getConnection()) {
            if (con != null) {
                System.out.println("Connected Successfully to database!");
                System.out.println("Catalog: " + con.getCatalog());
            }
        } catch (SQLException e) {
            System.err.println("SQL Exception: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Exception: " + e.getMessage());
            e.printStackTrace();
        }
    }
}