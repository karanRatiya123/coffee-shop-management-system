package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.user;
import Backend.util.DBConnection;
public class UserDAO {

public user login(String username, String pinCode) {

    user u = null;

    try {

        Connection con = DBConnection.getConnection();

        String sql =
        "SELECT * FROM users WHERE username=? AND pin_code=?  AND status='Active'";

        PreparedStatement ps = con.prepareStatement(sql);

        ps.setString(1, username);
        ps.setString(2, pinCode);

        ResultSet rs = ps.executeQuery();

        if (rs.next()) {

            u = new user();

            u.setUserId(rs.getInt("user_id"));
            u.setUsername(rs.getString("username"));
            u.setEmail(rs.getString("email"));
            u.setPinCode(rs.getString("pin_code"));
            u.setRole(rs.getString("role"));
            u.setStatus(rs.getString("status"));
            u.setAvatar(rs.getString("avatar"));


        }

        rs.close();
        ps.close();
        con.close();

    } catch (Exception e) {
        e.printStackTrace();
    }

    return u;
}
    public ArrayList<user> getAllOperators() {

        ArrayList<user> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql =
            "SELECT * FROM users WHERE status='Active' ORDER BY username";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {

                user u = new user();

                u.setUserId(rs.getInt("user_id"));
                u.setUsername(rs.getString("username"));
                try { u.setEmail(rs.getString("email")); } catch (Exception ignored) {}
                try { u.setRole(rs.getString("role")); } catch (Exception ignored) {}
                try { u.setAvatar(rs.getString("avatar")); } catch (Exception ignored) {}

                list.add(u);

            }

            rs.close();
            ps.close();
            con.close();

        } catch (Exception e) {

            e.printStackTrace();

        }

        return list;
    }
}
