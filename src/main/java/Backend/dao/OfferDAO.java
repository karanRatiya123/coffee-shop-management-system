package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Offer;
import Backend.util.DBConnection;

public class OfferDAO {

    public ArrayList<Offer> getAllOffers(){

        ArrayList<Offer> list=new ArrayList<>();

        try{

            Connection con=DBConnection.getConnection();

            String sql="SELECT * FROM offers";

            PreparedStatement ps=con.prepareStatement(sql);

            ResultSet rs=ps.executeQuery();

            while(rs.next()){

                Offer offer=new Offer();

                offer.setOfferId(rs.getInt("offer_id"));
                offer.setOfferName(rs.getString("offer_name"));
                offer.setDescription(rs.getString("description"));
                offer.setDiscount(rs.getDouble("discount"));
                offer.setStartDate(rs.getDate("start_date"));
                offer.setEndDate(rs.getDate("end_date"));
                offer.setStatus(rs.getString("status"));

                list.add(offer);

            }

            con.close();

        }catch(Exception e){
            e.printStackTrace();
        }

        return list;

    }

    public Offer getOfferById(int offerId){

        Offer offer=null;

        try{

            Connection con=DBConnection.getConnection();

            String sql="SELECT * FROM offers WHERE offer_id=?";

            PreparedStatement ps=con.prepareStatement(sql);

            ps.setInt(1,offerId);

            ResultSet rs=ps.executeQuery();

            if(rs.next()){

                offer=new Offer();

                offer.setOfferId(rs.getInt("offer_id"));
                offer.setOfferName(rs.getString("offer_name"));
                offer.setDescription(rs.getString("description"));
                offer.setDiscount(rs.getDouble("discount"));
                offer.setStartDate(rs.getDate("start_date"));
                offer.setEndDate(rs.getDate("end_date"));
                offer.setStatus(rs.getString("status"));

            }

            con.close();

        }catch(Exception e){
            e.printStackTrace();
        }

        return offer;

    }

}