package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Inventory;
import Backend.util.DBConnection;

public class InventoryDAO {

    // Display all inventory items
    public ArrayList<Inventory> getAllInventory() {

        ArrayList<Inventory> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM inventory";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Inventory inventory = new Inventory();

                inventory.setInventoryId(rs.getInt("inventory_id"));
                inventory.setItemName(rs.getString("item_name"));
                inventory.setCategory(rs.getString("category"));
                inventory.setQuantity(rs.getInt("quantity"));
                inventory.setUnit(rs.getString("unit"));
                inventory.setMinimumStock(rs.getInt("minimum_stock"));
                inventory.setStatus(rs.getString("status"));

                list.add(inventory);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // Get inventory item by ID
    public Inventory getInventoryById(int inventoryId) {

        Inventory inventory = null;

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM inventory WHERE inventory_id=?";

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, inventoryId);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                inventory = new Inventory();

                inventory.setInventoryId(rs.getInt("inventory_id"));
                inventory.setItemName(rs.getString("item_name"));
                inventory.setCategory(rs.getString("category"));
                inventory.setQuantity(rs.getInt("quantity"));
                inventory.setUnit(rs.getString("unit"));
                inventory.setMinimumStock(rs.getInt("minimum_stock"));
                inventory.setStatus(rs.getString("status"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return inventory;
    }

    // Get low stock items
    public ArrayList<Inventory> getLowStockItems() {

        ArrayList<Inventory> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM inventory WHERE quantity <= minimum_stock";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Inventory inventory = new Inventory();

                inventory.setInventoryId(rs.getInt("inventory_id"));
                inventory.setItemName(rs.getString("item_name"));
                inventory.setCategory(rs.getString("category"));
                inventory.setQuantity(rs.getInt("quantity"));
                inventory.setUnit(rs.getString("unit"));
                inventory.setMinimumStock(rs.getInt("minimum_stock"));
                inventory.setStatus(rs.getString("status"));

                list.add(inventory);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}