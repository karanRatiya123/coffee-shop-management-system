package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Menu;
import Backend.util.DBConnection;

public class MenuDAO {

    // Display all available menu items
    public ArrayList<Menu> getAllMenuItems() {

        ArrayList<Menu> list = new ArrayList<>();

        try {
            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM menu_items WHERE availability='Available'";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                Menu menu = new Menu();

                menu.setMenuId(rs.getInt("menu_id"));
                menu.setCategoryId(rs.getInt("category_id"));
                menu.setItemName(rs.getString("item_name"));
                menu.setDescription(rs.getString("description"));
                menu.setPrice(rs.getDouble("price"));
                menu.setAvailability(rs.getString("availability"));
                menu.setImage(rs.getString("image"));

                list.add(menu);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // Get one menu item by ID
    public Menu getMenuById(int menuId) {

        Menu menu = null;

        try {
            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM menu_items WHERE menu_id=?";

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, menuId);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                menu = new Menu();

                menu.setMenuId(rs.getInt("menu_id"));
                menu.setCategoryId(rs.getInt("category_id"));
                menu.setItemName(rs.getString("item_name"));
                menu.setDescription(rs.getString("description"));
                menu.setPrice(rs.getDouble("price"));
                menu.setAvailability(rs.getString("availability"));
                menu.setImage(rs.getString("image"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return menu;
    }
}